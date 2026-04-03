/**
 * @fileoverview Simple SMTP email service.
 */

const nodemailer = require('nodemailer');
const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');

const log = createLogger('email');

/** Create SMTP transporter */
function createTransporter() {
  const env = getEnv();
  return nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_SECURE || false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

/** Send email */
async function sendEmail(transporter, opts) {
  const env = getEnv();
  const from = env.EMAIL_FROM || env.SMTP_USER || 'CarVerify AI <noreply@carverify.ai>';
  
  try {
    const result = await transporter.sendMail({
      from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html,
    });
    log.info({ to: opts.to, subject: opts.subject });
    return result;
  } catch (err) {
    log.error({ err }, 'Failed to send email');
    throw err;
  }
}

// Templates
const templates = {
  welcome: (name) => ({
    subject: 'Welcome to CarVerify AI!',
    text: `Hi ${name},\n\nWelcome! Your account is ready.\n\nGet started: https://carverify.ai/dashboard\n\nThanks,\nCarVerify AI Team`,
    html: `<h1>Welcome!</h1><p>Hi ${name}, your account is ready.</p><a href="https://carverify.ai/dashboard">Get Started</a>`,
  }),
  passwordReset: (otp) => ({
    subject: 'Reset your CarVerify AI password',
    text: `Your reset code: ${otp}\n\nExpires in 15 minutes.`,
    html: `<h1>Reset Password</h1><p>Code: <strong>${otp}</strong></p><p>Expires in 15 min.</p>`,
  }),
  verifyEmail: (otp) => ({
    subject: 'Verify your CarVerify AI email',
    text: `Verification code: ${otp}`,
    html: `<h1>Verify Email</h1><p>Code: <strong>${otp}</strong></p>`,
  }),
};

module.exports = { createTransporter, sendEmail, templates };