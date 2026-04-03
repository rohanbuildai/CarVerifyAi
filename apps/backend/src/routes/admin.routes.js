const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('@carverify/security/src/rbac');
const { adminController } = require('../controllers/admin.controller');

function createAdminRoutes() {
  const router = Router();
  router.use(requireAuth, requireAdmin);

  router.get('/users', adminController.listUsers);
  router.get('/users/:userId', adminController.getUser);
  router.patch('/users/:userId', adminController.updateUser);
  router.get('/reports', adminController.listReports);
  router.get('/payments', adminController.listPayments);
  router.post('/refunds', adminController.issueRefund);
  router.get('/failed-jobs', adminController.listFailedJobs);
  router.post('/failed-jobs/:jobId/retry', adminController.retryFailedJob);
  router.get('/feature-flags', adminController.getFeatureFlags);
  router.patch('/feature-flags/:key', adminController.updateFeatureFlag);
  router.get('/stats', adminController.getStats);

  return router;
}

module.exports = { createAdminRoutes };
