/**
 * @fileoverview Express application factory. Configures middleware stack and routes.
 * @module backend/app
 */

require('express-async-errors');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { getEnv } = require('@carverify/config');
const { securityHeaders } = require('@carverify/security/src/headers');
const { metricsMiddleware } = require('@carverify/observability/src/metrics');
const { requestIdMiddleware } = require('./middleware/request-id');
const { errorHandler } = require('./middleware/error-handler');
const { createRoutes } = require('./routes');

/**
 * Create and configure the Express app.
 * @param {Object} deps - Injected dependencies (redis, queues, etc.)
 * @returns {express.Application}
 */
function createApp(deps) {
  const app = express();
  const env = getEnv();

  // ── Trust proxy (behind nginx / load balancer) ──────────
  app.set('trust proxy', 1);

  // ── Security headers ────────────────────────────────────
  app.use(securityHeaders());

  // ── Request ID ──────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── Metrics ─────────────────────────────────────────────
  app.use(metricsMiddleware);

  // ── CORS ────────────────────────────────────────────────
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(cors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-Id', 'Idempotency-Key'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    maxAge: 86400,
  }));

  // ── Compression ─────────────────────────────────────────
  app.use(compression());

  // ── Cookie parser ───────────────────────────────────────
  app.use(cookieParser());

  // ── Body parsers ────────────────────────────────────────
  // Webhook route needs raw body — handled in webhook route
  app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Routes ──────────────────────────────────────────────
  app.use('/api/v1', createRoutes(deps));

  // ── 404 handler ─────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
    });
  });

  // ── Error handler (must be last) ────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
