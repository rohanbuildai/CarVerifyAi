/**
 * @fileoverview Global error handler middleware.
 * Normalizes all errors into structured JSON responses.
 */

const { createLogger } = require('@carverify/observability');
const { AppError } = require('@carverify/shared');
const { ZodError } = require('zod');

const log = createLogger('error-handler');

/**
 * Express error handler.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Known operational errors
  if (err instanceof AppError && err.isOperational) {
    if (err.statusCode >= 500) {
      log.error({ err, requestId: req.id }, err.message);
    } else {
      log.warn({ statusCode: err.statusCode, code: err.code, requestId: req.id }, err.message);
    }

    const body = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) body.error.details = err.details;
    if (err.upgradeUrl) body.error.upgradeUrl = err.upgradeUrl;
    if (err.retryAfter) body.error.retryAfter = err.retryAfter;

    return res.status(err.statusCode).json(body);
  }

  // Unknown / programmer errors
  log.error({ err, requestId: req.id, stack: err.stack }, 'Unhandled error');

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}

module.exports = { errorHandler };
