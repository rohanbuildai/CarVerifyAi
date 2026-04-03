/**
 * @fileoverview Zod validation middleware factory.
 */

const { ZodError } = require('zod');

/**
 * Validate request body against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }
    req.validated = result.data;
    next();
  };
}

/**
 * Validate query parameters.
 * @param {import('zod').ZodSchema} schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: result.error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}

module.exports = { validate, validateQuery };
