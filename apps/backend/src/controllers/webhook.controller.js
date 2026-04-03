/**
 * @fileoverview Webhook controller — Razorpay webhook handler with signature verification.
 */

const crypto = require('crypto');
const { prisma } = require('@carverify/db');
const { getEnv } = require('@carverify/config');
const { auditLog } = require('@carverify/security/src/audit');
const { createLogger } = require('@carverify/observability');

const log = createLogger('webhook-controller');

const webhookController = {
  /**
   * POST /webhooks/razorpay
   * Raw body is available because app.js applies express.raw() before json parser for this route.
   */
  async handleRazorpay(req, res) {
    const env = getEnv();
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    if (!signature || !rawBody) {
      log.warn('Webhook received without signature or body');
      return res.status(400).json({ error: { code: 'INVALID_WEBHOOK', message: 'Missing signature' } });
    }

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSig) {
      log.warn('Webhook signature verification failed');
      return res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Signature mismatch' } });
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const eventId = payload.payload?.payment?.entity?.id || payload.payload?.subscription?.entity?.id || `evt_${Date.now()}`;

    // Idempotency check
    const idempotencyKey = `rzp_${eventId}_${event}`;
    const existing = await prisma.webhookReceived.findUnique({ where: { idempotencyKey } });
    if (existing) {
      log.info({ idempotencyKey }, 'Duplicate webhook, skipping');
      return res.json({ received: true, duplicate: true });
    }

    // Record webhook
    await prisma.webhookReceived.create({
      data: {
        source: 'razorpay',
        eventType: event,
        idempotencyKey,
        rawPayload: payload,
        verified: true,
      },
    });

    // Process based on event type
    try {
      switch (event) {
        case 'payment.captured': {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.order_id;

          const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: orderId } });
          if (order) {
            await prisma.$transaction(async (tx) => {
              await tx.paymentOrder.update({
                where: { id: order.id },
                data: { status: 'paid', razorpayPaymentId: paymentEntity.id },
              });

              await tx.paymentEvent.create({
                data: { orderId: order.id, eventType: event, rawPayload: payload },
              });

              // Unlock report if one-time purchase
              if (order.type === 'one_time_report' && order.reportId) {
                await tx.riskReport.update({
                  where: { id: order.reportId },
                  data: { isPaid: true, paidAt: new Date() },
                });
              }
            });

            await auditLog({ userId: order.userId, action: 'payment.captured', resource: 'payment_order', resourceId: order.id });
            log.info({ orderId: order.id, razorpayOrderId: orderId }, 'Payment captured');
          }
          break;
        }

        case 'payment.failed': {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.order_id;

          const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: orderId } });
          if (order) {
            await prisma.paymentOrder.update({
              where: { id: order.id },
              data: { status: 'failed' },
            });
            log.warn({ orderId: order.id }, 'Payment failed');
          }
          break;
        }

        case 'subscription.activated': {
          const subEntity = payload.payload.subscription.entity;
          const sub = await prisma.subscription.findUnique({
            where: { razorpaySubscriptionId: subEntity.id },
          });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                status: 'active',
                currentPeriodStart: new Date(subEntity.current_start * 1000),
                currentPeriodEnd: new Date(subEntity.current_end * 1000),
              },
            });
            log.info({ subId: sub.id }, 'Subscription activated');
          }
          break;
        }

        case 'subscription.charged': {
          const subEntity = payload.payload.subscription.entity;
          const sub = await prisma.subscription.findUnique({
            where: { razorpaySubscriptionId: subEntity.id },
          });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                currentPeriodStart: new Date(subEntity.current_start * 1000),
                currentPeriodEnd: new Date(subEntity.current_end * 1000),
                reportsUsedThisMonth: 0,
              },
            });
            log.info({ subId: sub.id }, 'Subscription charged, quota reset');
          }
          break;
        }

        case 'subscription.cancelled': {
          const subEntity = payload.payload.subscription.entity;
          const sub = await prisma.subscription.findUnique({
            where: { razorpaySubscriptionId: subEntity.id },
          });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'cancelled', cancelledAt: new Date() },
            });
            log.info({ subId: sub.id }, 'Subscription cancelled via webhook');
          }
          break;
        }

        default:
          log.info({ event }, 'Unhandled webhook event type');
      }

      // Mark processed
      await prisma.webhookReceived.update({
        where: { idempotencyKey },
        data: { processedAt: new Date() },
      });
    } catch (err) {
      log.error({ err, event }, 'Webhook processing error');
    }

    res.json({ received: true });
  },
};

module.exports = { webhookController };
