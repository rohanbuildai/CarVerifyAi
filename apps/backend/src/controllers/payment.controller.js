/**
 * @fileoverview Payment controller — create orders, subscriptions, manage billing.
 */

const { prisma } = require('@carverify/db');
const { getEnv } = require('@carverify/config');
const { NotFoundError, ForbiddenError, AppError, PAYMENT_STATUS } = require('@carverify/shared');
const { auditFromReq } = require('@carverify/security/src/audit');
const { createLogger } = require('@carverify/observability');

const log = createLogger('payment-controller');

/**
 * Lazy-load Razorpay to avoid import errors if keys not set.
 */
function getRazorpay() {
  const { createRazorpayClient } = require('@carverify/payments/src/razorpay');
  return createRazorpayClient();
}

const paymentController = {
  /**
   * POST /payments/orders — create one-time payment order
   */
  async createOrder(req, res) {
    const { type, reportId, idempotencyKey } = req.validated;
    const env = getEnv();

    const report = await prisma.riskReport.findUnique({
      where: { id: reportId },
      include: { query: { select: { userId: true } } },
    });

    if (!report) throw new NotFoundError('Report');
    if (report.query.userId !== req.user.id) throw new ForbiddenError();
    if (report.isPaid) throw new AppError('Report is already unlocked', 400, 'ALREADY_PAID');

    const amountInr = env.PRICE_SINGLE_REPORT; // in paise
    const razorpay = getRazorpay();

    const rzpOrder = await razorpay.orders.create({
      amount: amountInr,
      currency: 'INR',
      receipt: `report_${reportId}`,
      notes: { reportId, userId: req.user.id, type },
    });

    const order = await prisma.paymentOrder.create({
      data: {
        userId: req.user.id,
        razorpayOrderId: rzpOrder.id,
        type: 'one_time_report',
        amountInr,
        status: PAYMENT_STATUS.CREATED,
        reportId,
        idempotencyKey,
      },
    });

    await auditFromReq(req, 'payment.order_created', { resource: 'payment_order', resourceId: order.id });

    res.status(201).json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: amountInr,
      currency: 'INR',
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    });
  },

  /**
   * GET /payments/orders
   */
  async listOrders(req, res) {
    const orders = await prisma.paymentOrder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ data: orders });
  },

  /**
   * POST /payments/subscriptions
   */
  async createSubscription(req, res) {
    const { plan } = req.validated;
    const env = getEnv();

    const planId = plan === 'monthly' ? env.RAZORPAY_PLAN_MONTHLY : env.RAZORPAY_PLAN_ANNUAL;

    if (!planId) {
      throw new AppError('Subscription plan not configured', 500, 'PLAN_NOT_CONFIGURED');
    }

    const razorpay = getRazorpay();

    const rzpSub = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: plan === 'monthly' ? 12 : 1,
      customer_notify: 1,
      notes: { userId: req.user.id, plan },
    });

    await prisma.subscription.create({
      data: {
        userId: req.user.id,
        razorpaySubscriptionId: rzpSub.id,
        plan,
        status: 'created',
        reportsPerMonth: plan === 'monthly' ? 15 : 20,
      },
    });

    await auditFromReq(req, 'payment.subscription_created', { metadata: { plan } });

    res.status(201).json({
      subscriptionId: rzpSub.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    });
  },

  /**
   * GET /payments/subscriptions/current
   */
  async getCurrentSubscription(req, res) {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: { in: ['active', 'past_due'] } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ subscription: sub || null });
  },

  /**
   * POST /payments/subscriptions/cancel
   */
  async cancelSubscription(req, res) {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'active', plan: { not: 'free' } },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) throw new NotFoundError('Active subscription');

    if (sub.razorpaySubscriptionId) {
      const razorpay = getRazorpay();
      await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, { cancel_at_cycle_end: 1 });
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    await auditFromReq(req, 'payment.subscription_cancelled', { resource: 'subscription', resourceId: sub.id });

    res.json({ success: true, message: 'Subscription will be cancelled at end of billing period' });
  },
};

module.exports = { paymentController };
