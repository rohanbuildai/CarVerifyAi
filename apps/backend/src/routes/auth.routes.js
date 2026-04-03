/**
 * @fileoverview Auth routes — register, login, logout, session check.
 */

const { Router } = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { createRateLimiter } = require('@carverify/security/src/rate-limit');
const { registerSchema, loginSchema } = require('@carverify/shared');
const { authController } = require('../controllers/auth.controller');

function createAuthRoutes({ redis }) {
  const router = Router();

  const loginLimiter = createRateLimiter(redis, {
    max: 10, windowMs: 900000, prefix: 'rl:login',
    keyFn: (req) => req.ip,
  });

  const registerLimiter = createRateLimiter(redis, {
    max: 10, windowMs: 3600000, prefix: 'rl:register',
    keyFn: (req) => req.ip,
  });

  router.post('/register', registerLimiter, validate(registerSchema), authController.register);
  router.post('/login', loginLimiter, validate(loginSchema), authController.login);
  router.post('/logout', requireAuth, authController.logout);
  router.get('/me', requireAuth, authController.me);

  return router;
}

module.exports = { createAuthRoutes };
