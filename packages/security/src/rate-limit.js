/**
 * @fileoverview Redis sliding-window rate limiter.
 * @module @carverify/security
 */

const { createLogger } = require('@carverify/observability');
const log = createLogger('rate-limit');

/**
 * Create a rate limiter middleware using Redis sliding window.
 * @param {import('ioredis').Redis} redis
 * @param {Object} options
 * @param {number} options.max - Max requests in window
 * @param {number} options.windowMs - Window size in ms
 * @param {(req: any) => string} [options.keyFn] - Function to extract rate limit key
 * @param {string} [options.prefix] - Redis key prefix
 * @returns {Function} Express middleware
 */
function createRateLimiter(redis, { max, windowMs, keyFn, prefix = 'rl' }) {
  return async (req, res, next) => {
    try {
      // Fail open if redis not available
      if (!redis || redis.status === 'wait' || redis.status === 'close') {
        log.warn('Redis not connected, skipping rate limiting');
        return next();
      }

      const key = keyFn ? keyFn(req) : (req.user?.id || req.ip);
      const redisKey = `${prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis pipeline for atomic sliding window
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(redisKey, 0, windowStart);
      pipeline.zadd(redisKey, now, `${now}-${Math.random().toString(36).slice(2, 8)}`);
      pipeline.zcard(redisKey);
      pipeline.pexpire(redisKey, windowMs);

      const results = await pipeline.exec();
      const count = results[2][1];

      // Set rate limit headers
      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
      res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));

      if (count > max) {
        const retryAfter = Math.ceil(windowMs / 1000);
        res.set('Retry-After', String(retryAfter));
        log.warn({ key, count, max }, 'Rate limit exceeded');
        return res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
            retryAfter,
          },
        });
      }

      next();
    } catch (err) {
      // On Redis failure, allow the request (fail-open) but log warning
      log.error({ err }, 'Rate limiter Redis error, failing open');
      next();
    }
  };
}

module.exports = { createRateLimiter };
