const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idempotencyGuard } = require('@carverify/security/src/idempotency');
const { createOrderSchema, createSubscriptionSchema } = require('@carverify/shared');
const { paymentController } = require('../controllers/payment.controller');

function createPaymentRoutes() {
  const router = Router();
  router.post('/orders', requireAuth, validate(createOrderSchema), idempotencyGuard(), paymentController.createOrder);
  router.get('/orders', requireAuth, paymentController.listOrders);
  router.post('/subscriptions', requireAuth, validate(createSubscriptionSchema), paymentController.createSubscription);
  router.get('/subscriptions/current', requireAuth, paymentController.getCurrentSubscription);
  router.post('/subscriptions/cancel', requireAuth, paymentController.cancelSubscription);
  return router;
}

module.exports = { createPaymentRoutes };
