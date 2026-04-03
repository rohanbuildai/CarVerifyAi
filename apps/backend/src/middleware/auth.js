/**
 * @fileoverview Auth middleware. Validates session token from cookie and attaches user to req.
 */

const { prisma } = require('@carverify/db');
const { AuthError } = require('@carverify/shared');
const { createLogger } = require('@carverify/observability');

const log = createLogger('auth-middleware');

/**
 * Require authenticated session. Reads cv_session cookie, validates against DB.
 */
async function requireAuth(req, res, next) {
  const token = req.cookies?.cv_session;
  if (!token) {
    throw new AuthError('Authentication required');
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true, role: true, status: true, preferredLang: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    // Clear stale cookie
    res.clearCookie('cv_session');
    throw new AuthError('Session expired');
  }

  if (session.user.status !== 'active') {
    throw new AuthError('Account is suspended');
  }

  req.user = session.user;
  req.sessionId = session.id;
  next();
}

/**
 * Optional auth - attaches user if session exists, but doesn't fail.
 */
async function optionalAuth(req, res, next) {
  const token = req.cookies?.cv_session;
  if (!token) return next();

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, name: true, role: true, status: true, preferredLang: true } } },
    });

    if (session && session.expiresAt > new Date() && session.user.status === 'active') {
      req.user = session.user;
      req.sessionId = session.id;
    }
  } catch (err) {
    log.warn({ err }, 'Optional auth check failed');
  }

  next();
}

module.exports = { requireAuth, optionalAuth };
