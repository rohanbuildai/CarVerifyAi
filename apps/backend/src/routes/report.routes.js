const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { reportController } = require('../controllers/report.controller');

function createReportRoutes() {
  const router = Router();
  router.get('/:reportId', requireAuth, reportController.getReport);
  router.get('/:reportId/sections', requireAuth, reportController.getSections);
  return router;
}

module.exports = { createReportRoutes };
