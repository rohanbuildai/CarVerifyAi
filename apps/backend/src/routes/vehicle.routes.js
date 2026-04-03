const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { createRateLimiter } = require('@carverify/security/src/rate-limit');
const { idempotencyGuard } = require('@carverify/security/src/idempotency');
const { vehicleSearchSchema, paginationSchema } = require('@carverify/shared');
const { vehicleController } = require('../controllers/vehicle.controller');

function createVehicleRoutes({ redis }) {
  const router = Router();

  const searchLimiter = createRateLimiter(redis, {
    max: 10, windowMs: 60000, prefix: 'rl:search',
    keyFn: (req) => req.user?.id,
  });

  router.post('/search', requireAuth, searchLimiter, validate(vehicleSearchSchema), idempotencyGuard(), vehicleController.search);
  router.get('/queries', requireAuth, validateQuery(paginationSchema), vehicleController.listQueries);
  router.get('/queries/:queryId', requireAuth, vehicleController.getQuery);

  return router;
}

module.exports = { createVehicleRoutes };
