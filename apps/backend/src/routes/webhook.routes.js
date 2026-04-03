const { Router } = require('express');
const { webhookController } = require('../controllers/webhook.controller');

function createWebhookRoutes() {
  const router = Router();
  // Raw body parsing is handled in app.js before json parser
  router.post('/razorpay', webhookController.handleRazorpay);
  return router;
}

module.exports = { createWebhookRoutes };
