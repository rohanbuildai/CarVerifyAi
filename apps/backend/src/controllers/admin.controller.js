/**
 * @fileoverview Admin controller — user/report/payment management, feature flags.
 */

const { prisma } = require('@carverify/db');
const { NotFoundError } = require('@carverify/shared');
const { auditFromReq } = require('@carverify/security/src/audit');
const { createLogger } = require('@carverify/observability');

const log = createLogger('admin-controller');

const adminController = {
  async listUsers(req, res) {
    const { cursor, pageSize = 20 } = req.query;
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: Number(pageSize) + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = users.length > Number(pageSize);
    const data = hasMore ? users.slice(0, Number(pageSize)) : users;
    res.json({ data, cursor: hasMore ? data[data.length - 1].id : null, hasMore });
  },

  async getUser(req, res) {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, email: true, name: true, phone: true, role: true, status: true, createdAt: true, preferredLang: true },
    });
    if (!user) throw new NotFoundError('User');
    const sub = await prisma.subscription.findFirst({ where: { userId: user.id, status: 'active' }, orderBy: { createdAt: 'desc' } });
    const queryCount = await prisma.vehicleQuery.count({ where: { userId: user.id } });
    res.json({ user, subscription: sub, queryCount });
  },

  async updateUser(req, res) {
    const { status, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { ...(status ? { status } : {}), ...(role ? { role } : {}) },
      select: { id: true, email: true, status: true, role: true },
    });
    await auditFromReq(req, 'admin.user_updated', { resource: 'user', resourceId: user.id, metadata: { status, role } });
    res.json({ user });
  },

  async listReports(req, res) {
    const { cursor, pageSize = 20 } = req.query;
    const reports = await prisma.riskReport.findMany({
      include: { query: { select: { queryInput: true, userId: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(pageSize) + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = reports.length > Number(pageSize);
    const data = hasMore ? reports.slice(0, Number(pageSize)) : reports;
    res.json({ data, cursor: hasMore ? data[data.length - 1].id : null, hasMore });
  },

  async listPayments(req, res) {
    const { cursor, pageSize = 20 } = req.query;
    const payments = await prisma.paymentOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(pageSize) + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = payments.length > Number(pageSize);
    const data = hasMore ? payments.slice(0, Number(pageSize)) : payments;
    res.json({ data, cursor: hasMore ? data[data.length - 1].id : null, hasMore });
  },

  async issueRefund(req, res) {
    const { paymentOrderId, amount } = req.body;
    const order = await prisma.paymentOrder.findUnique({ where: { id: paymentOrderId } });
    if (!order || !order.razorpayPaymentId) throw new NotFoundError('Payment');

    const { createRazorpayClient } = require('@carverify/payments/src/razorpay');
    const razorpay = createRazorpayClient();
    await razorpay.payments.refund(order.razorpayPaymentId, { amount: amount || order.amountInr });

    await prisma.paymentOrder.update({ where: { id: order.id }, data: { status: 'refunded' } });
    if (order.reportId) {
      await prisma.riskReport.update({ where: { id: order.reportId }, data: { isPaid: false } });
    }

    await auditFromReq(req, 'admin.refund_issued', { resource: 'payment_order', resourceId: order.id, metadata: { amount } });
    log.info({ orderId: order.id }, 'Refund issued');
    res.json({ success: true });
  },

  async listFailedJobs(req, res) {
    const jobs = await prisma.failedJob.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ data: jobs });
  },

  async retryFailedJob(req, res) {
    const job = await prisma.failedJob.findUnique({ where: { id: req.params.jobId } });
    if (!job) throw new NotFoundError('Failed job');
    // Re-enqueue logic would go here via BullMQ
    await prisma.failedJob.update({ where: { id: job.id }, data: { resolvedAt: new Date() } });
    await auditFromReq(req, 'admin.job_retried', { resource: 'failed_job', resourceId: job.id });
    res.json({ success: true });
  },

  async getFeatureFlags(req, res) {
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    res.json({ data: flags });
  },

  async updateFeatureFlag(req, res) {
    const { enabled, description } = req.body;
    const flag = await prisma.featureFlag.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, enabled: !!enabled, description },
      update: { enabled: !!enabled, ...(description !== undefined ? { description } : {}) },
    });
    await auditFromReq(req, 'admin.feature_flag_updated', { resource: 'feature_flag', resourceId: flag.id, metadata: { key: flag.key, enabled } });
    res.json({ flag });
  },

  async getStats(req, res) {
    const [userCount, reportCount, paidReports, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.riskReport.count(),
      prisma.riskReport.count({ where: { isPaid: true } }),
      prisma.paymentOrder.aggregate({ where: { status: 'paid' }, _sum: { amountInr: true } }),
    ]);
    res.json({
      users: userCount,
      reports: reportCount,
      paidReports,
      totalRevenueInr: (revenue._sum.amountInr || 0) / 100,
    });
  },
};

module.exports = { adminController };
