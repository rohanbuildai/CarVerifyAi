/**
 * @fileoverview Auth controller — register, login, logout, me.
 */

const crypto = require('crypto');
const argon2 = require('argon2');
const { prisma } = require('@carverify/db');
const { getEnv } = require('@carverify/config');
const { ConflictError, AuthError, ROLES, SUB_PLAN } = require('@carverify/shared');
const { auditFromReq } = require('@carverify/security/src/audit');
const { createLogger } = require('@carverify/observability');

const log = createLogger('auth-controller');

const authController = {
  /**
   * POST /auth/register
   */
  async register(req, res) {
    const { email, password, name, phone, preferredLang } = req.validated;
    const env = getEnv();

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('An account with this email already exists');

    if (phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) throw new ConflictError('This phone number is already registered');
    }

    // Hash password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user + free tier quota + session in transaction
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_MS);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash, name, phone, preferredLang, role: ROLES.USER },
      });

      // Create free tier subscription
      await tx.subscription.create({
        data: {
          userId: newUser.id,
          plan: SUB_PLAN.FREE,
          status: 'active',
          reportsPerMonth: 0,
          reportsUsedThisMonth: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create free search quota
      const now = new Date();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await tx.usageQuota.create({
        data: {
          userId: newUser.id,
          quotaType: 'free_searches',
          limitValue: env.FREE_SEARCHES_PER_MONTH,
          usedValue: 0,
          periodStart: now,
          periodEnd: monthEnd,
        },
      });

      // Create session
      await tx.session.create({
        data: {
          userId: newUser.id,
          token: sessionToken,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          expiresAt,
        },
      });

      return newUser;
    });

    // Set cookie
    res.cookie('cv_session', sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_MAX_AGE_MS,
      path: '/',
    });

    res.cookie('cv_role', user.role, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_MAX_AGE_MS,
      path: '/',
    });

    await auditFromReq(req, 'user.registered', { resource: 'user', resourceId: user.id });

    log.info({ userId: user.id }, 'User registered');

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, preferredLang: user.preferredLang },
    });
  },

  /**
   * POST /auth/login
   */
  async login(req, res) {
    const { email, password } = req.validated;
    const env = getEnv();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AuthError('Invalid email or password');
    if (user.status !== 'active') throw new AuthError('Account is suspended');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new AuthError('Invalid email or password');

    // Enforce max 5 sessions
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    if (sessions.length >= 5) {
      await prisma.session.delete({ where: { id: sessions[0].id } });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_MS);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt,
      },
    });

    res.cookie('cv_session', sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_MAX_AGE_MS,
      path: '/',
    });

    res.cookie('cv_role', user.role, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_MAX_AGE_MS,
      path: '/',
    });

    await auditFromReq(req, 'user.login', { resource: 'user', resourceId: user.id });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, preferredLang: user.preferredLang },
    });
  },

  /**
   * POST /auth/logout
   */
  async logout(req, res) {
    await prisma.session.deleteMany({ where: { id: req.sessionId } });
    res.clearCookie('cv_session');
    res.clearCookie('cv_role');
    await auditFromReq(req, 'user.logout');
    res.json({ success: true });
  },

  /**
   * GET /auth/me
   */
  async me(req, res) {
    res.json({ user: req.user });
  },

  /**
   * POST /auth/forgot-password - Send OTP
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.validated;
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Don't reveal if email exists
        return res.json({ success: true, message: 'If email exists, OTP sent' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await prisma.passwordReset.create({
        data: { userId: user.id, otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      });

      // Send email with OTP
      try {
        // Use absolute path (backend/src/controllers -> root)
        const path = require('path');
        const emailPath = path.join(__dirname, '../../../../packages/email/src/index.js');
        const { createTransporter, sendEmail, templates } = require(emailPath);
        const transporter = createTransporter();
        await sendEmail(transporter, { to: email, ...templates.passwordReset(otp) });
        log.info({ email }, 'OTP email sent');
      } catch (emailErr) {
        // Log but don't fail - OTP still works, user can see it in console
        log.warn({ email, error: emailErr.message }, 'Failed to send OTP email');
      }

      log.info({ email, otp }, 'Password reset OTP');
      res.json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
      log.error({ err }, 'forgotPassword error');
      res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to send OTP' } });
    }
  },

  /**
   * POST /auth/reset-password - Reset with OTP
   */
  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.validated;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP' } });
    }

    const reset = await prisma.passwordReset.findFirst({
      where: { userId: user.id, otp, used: false },
    });

    if (!reset || new Date() > reset.expiresAt) {
      return res.status(400).json({ error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' } });
    }

    const { hash } = await argon2.hash(newPassword, { memoryCost: 65536, timeCost: 3, parallelism: 1 });
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
    await prisma.session.deleteMany({ where: { userId: user.id } });

    res.json({ success: true, message: 'Password reset successful' });
  },
};

module.exports = { authController };
