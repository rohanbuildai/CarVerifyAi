/**
 * @fileoverview Route aggregator. Mounts all route modules under /api/v1.
 */

const { Router } = require('express');
const { createAuthRoutes } = require('./auth.routes');
const { createVehicleRoutes } = require('./vehicle.routes');
const { createReportRoutes } = require('./report.routes');
const { createChatRoutes } = require('./chat.routes');
const { createPaymentRoutes } = require('./payment.routes');
const { createWebhookRoutes } = require('./webhook.routes');
const { createAdminRoutes } = require('./admin.routes');
const { createSystemRoutes } = require('./system.routes');

/**
 * @param {Object} deps - { redis, queues }
 * @returns {Router}
 */
function createRoutes(deps) {
  const router = Router();

  router.use('/auth', createAuthRoutes(deps));
  router.use('/vehicles', createVehicleRoutes(deps));
  router.use('/reports', createReportRoutes(deps));
  router.use('/chat', createChatRoutes(deps));
  router.use('/payments', createPaymentRoutes(deps));
  router.use('/webhooks', createWebhookRoutes(deps));
  router.use('/admin', createAdminRoutes(deps));
  router.use('/', createSystemRoutes(deps));

  return router;
}

module.exports = { createRoutes };
