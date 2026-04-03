/**
 * @fileoverview Idempotency middleware for preventing duplicate mutations.
 * @module @carverify/security
 */

const { createLogger } = require('@carverify/observability');
const { prisma } = require('@carverify/db');
const log = createLogger('idempotency');

/**
 * Idempotency middleware. Checks if request with same key was already processed.
 * If so, returns cached response. Otherwise, processes and caches.
 * @param {Object} [options]
 * @param {number} [options.ttlMs=86400000] - Cache TTL in ms (default 24h)
 * @returns {Function} Express middleware
 */
function idempotencyGuard({ ttlMs = 86400000 } = {}) {
  return async (req, res, next) => {
    const key = req.body?.idempotencyKey || req.headers['idempotency-key'];
    if (!key) return next();

    try {
      const existing = await prisma.idempotencyKey.findUnique({ where: { key } });

      if (existing && existing.expiresAt > new Date()) {
        log.info({ key }, 'Idempotent request — returning cached response');
        return res.status(existing.statusCode || 200).json(existing.response);
      }

      // Wrap res.json to capture the response
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await prisma.idempotencyKey.upsert({
            where: { key },
            create: {
              key,
              response: body,
              statusCode: res.statusCode,
              expiresAt: new Date(Date.now() + ttlMs),
            },
            update: {
              response: body,
              statusCode: res.statusCode,
              expiresAt: new Date(Date.now() + ttlMs),
            },
          });
        } catch (err) {
          log.error({ err, key }, 'Failed to cache idempotency response');
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      log.error({ err }, 'Idempotency check error, proceeding');
      next();
    }
  };
}

module.exports = { idempotencyGuard };
