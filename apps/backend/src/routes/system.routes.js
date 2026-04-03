const { Router } = require('express');
const { systemController } = require('../controllers/system.controller');

function createSystemRoutes() {
  const router = Router();
  router.get('/health', systemController.health);
  router.get('/ready', systemController.ready);
  router.get('/metrics', systemController.metrics);
  return router;
}

module.exports = { createSystemRoutes };
