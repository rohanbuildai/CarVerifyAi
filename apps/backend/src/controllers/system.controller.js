/**
 * @fileoverview System controller — health, readiness, metrics.
 */

const { prisma } = require('@carverify/db');
const { getMetrics } = require('@carverify/observability/src/metrics');

const startTime = Date.now();

const systemController = {
  /** GET /health */
  async health(req, res) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - startTime) / 1000),
      version: process.env.APP_VERSION || '1.0.0',
    });
  },

  /** GET /ready */
  async ready(req, res) {
    const checks = { db: 'unknown', redis: 'unknown' };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = 'connected';
    } catch {
      checks.db = 'disconnected';
    }

    try {
      const { redis } = req.app.get('deps') || {};
      if (redis) {
        await redis.ping();
        checks.redis = 'connected';
      } else {
        checks.redis = 'not_configured';
      }
    } catch {
      checks.redis = 'disconnected';
    }

    const allHealthy = checks.db === 'connected' && (checks.redis === 'connected' || checks.redis === 'not_configured');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      ...checks,
    });
  },

  /** GET /metrics */
  async metrics(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(await getMetrics());
  },
};

module.exports = { systemController };
