/**
 * @fileoverview Auth routes — register, login, logout, session check.
 */

const { Router } = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { createRateLimiter } = require('@carverify/security/src/rate-limit');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('@carverify/shared');
const { authController } = require('../controllers/auth.controller');

function createAuthRoutes({ redis }) {
  const router = Router();

  // Skip rate limiting entirely in dev mode (redis not required)
  const loginLimiter = redis ? createRateLimiter(redis, {
    max: 100, windowMs: 900000, prefix: 'rl:login',
    keyFn: (req) => req.ip,
  }) : (req, res, next) => next();

  const registerLimiter = redis ? createRateLimiter(redis, {
    max: 100, windowMs: 3600000, prefix: 'rl:register',
    keyFn: (req) => req.ip,
  }) : (req, res, next) => next();

  router.post('/register', registerLimiter, validate(registerSchema), authController.register);
  router.post('/login', loginLimiter, validate(loginSchema), authController.login);
  router.post('/logout', requireAuth, authController.logout);
  router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
  router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
  // Use optionalAuth - returns user if logged in, null if not
  router.get('/me', optionalAuth, authController.me);

  return router;
}

module.exports = { createAuthRoutes };
