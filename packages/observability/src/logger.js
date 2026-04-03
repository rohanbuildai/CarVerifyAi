/**
 * @fileoverview Structured JSON logger using Pino.
 * PII-safe: redacts passwords, tokens, and card numbers from logs.
 * @module @carverify/observability
 */

const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'passwordHash',
  'token',
  'sessionToken',
  'secret',
  'creditCard',
  'razorpayKeySecret',
];

const logger = pino({
  level: logLevel,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.ip || req.remoteAddress,
      requestId: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});

/**
 * Create a child logger with context.
 * @param {string} module - Module name
 * @param {Object} [context] - Additional context
 * @returns {pino.Logger}
 */
function createLogger(module, context = {}) {
  return logger.child({ module, ...context });
}

module.exports = { logger, createLogger };
