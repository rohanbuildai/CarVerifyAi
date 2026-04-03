/**
 * @fileoverview Email service supporting multiple providers.
 * Supports: SMTP, SendGrid, Resend, Console (dev)
 */

const nodemailer = require('nodemailer');
const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');

const log = createLogger('email');

/**
 * Create email transporter based on config.
 * Supports: smtp, sendgrid, resend, console
 */
function createTransporter(config = {}) {
  const env = getEnv();
  const provider = config.provider || env.EMAIL_PROVIDER || 'console';

  switch (provider) {
    case 'smtp':
      return nodemailer.createTransport({
        host: config.host || env.SMTP_HOST,
        port: config.port || env.SMTP_PORT || 587,
        secure: config.secure || env.SMTP_SECURE || false,
        auth: {
          user: config.user || env.SMTP_USER,
          pass: config.pass || env.SMTP_PASS,
        },
      });

    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: config.apiKey || env.SENDGRID_API_KEY,
        },
      });

    case 'resend':
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        auth: {
          user: 'resend',
          pass: config.apiKey || env.RESEND_API_KEY,
        },
      });

    case 'console':
    default:
      // Dev mode: log emails to console
      return {
        sendMail: async (opts) => {
          log.info({ to: opts.to, subject: opts.subject }, '📧 Email (console mode)');
          log.info({ text: opts.text });
          return { messageId: 'console-' + Date.now() };
        },
      };
  }
}

/**
 * Send an email.
 * @param {Object} opts - Email options
 * @param {string} opts.to - Recipient email
 * @param {string} opts.subject - Email subject
 * @param {string} opts.text - Plain text body
 * @param {string} opts.html - HTML body (optional)
 */
async function sendEmail(transporter, opts) {
  const env = getEnv();
  const defaultFrom = env.EMAIL_FROM || 'CarVerify AI <noreply@carverify.ai>';

  try {
    const result = await transporter.sendMail({
      from: opts.from || defaultFrom,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    log.info({ to: opts.to, subject: opts.subject, messageId: result.messageId });
    return result;
  } catch (err) {
    log.error({ err, to: opts.to }, 'Failed to send email');
    throw err;
  }
}

// Email templates
const templates = {
  /** Welcome email */
  welcome: (name, email) => ({
    subject: 'Welcome to CarVerify AI!',
    text: `Hi ${name},

Welcome to CarVerify AI!

Your account has been created successfully.
Start_verifying vehicles with AI-powered reports.

Get started: https://carverify.ai/dashboard

Thanks,
The CarVerify AI Team`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #4F46E5;">Welcome to CarVerify AI!</h1>
  <p>Hi ${name},</p>
  <p>Your account has been created successfully.</p>
  <p>Start verifying vehicles with AI-powered reports.</p>
  <a href="https://carverify.ai/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Get Started</a>
  <p style="margin-top: 30px;">Thanks,<br>The CarVerify AI Team</p>
</body>
</html>`,
  }),

  /** Password reset OTP */
  passwordReset: (name, otp) => ({
    subject: 'Reset your CarVerify AI password',
    text: `Hi ${name},

Your password reset code is: ${otp}

This code expires in 15 minutes.

If you didn't request this, please ignore this email.

Thanks,
CarVerify AI`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #4F46E5;">Reset your password</h1>
  <p>Hi ${name},</p>
  <p>Your password reset code is:</p>
  <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 16px; text-align: center; letter-spacing: 4px;">${otp}</div>
  <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
  <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
  <p>Thanks,<br>CarVerify AI</p>
</body>
</html>`,
  }),

  /** Email verification */
  verifyEmail: (name, otp) => ({
    subject: 'Verify your CarVerify AI email',
    text: `Hi ${name},

Your email verification code is: ${otp}

Click here to verify: https://carverify.ai/verify-email?token=${otp}

Thanks,
CarVerify AI`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #4F46E5;">Verify your email</h1>
  <p>Hi ${name},</p>
  <p>Your verification code is:</p>
  <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 16px; text-align: center; letter-spacing: 4px;">${otp}</div>
  <p style="margin-top: 20px;"><a href="https://carverify.ai/verify-email?token=${otp}">Click here to verify</a></p>
  <p>Thanks,<br>CarVerify AI</p>
</body>
</html>`,
  }),
};

module.exports = { createTransporter, sendEmail, templates };