/**
 * @fileoverview Payment reconciliation job.
 */

const { prisma } = require('@carverify/db');
const { createLogger } = require('@carverify/observability');

const log = createLogger('job:payment-reconciliation');

async function processPaymentReconciliation(job) {
  // Find stale payment orders (created > 1 hour ago, still in 'created' status)
  const staleOrders = await prisma.paymentOrder.findMany({
    where: {
      status: 'created',
      createdAt: { lt: new Date(Date.now() - 3600000) },
    },
    take: 50,
  });

  for (const order of staleOrders) {
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { status: 'failed' },
    });
    log.info({ orderId: order.id }, 'Stale payment order marked as failed');
  }

  log.info({ count: staleOrders.length }, 'Payment reconciliation complete');
}

module.exports = { processPaymentReconciliation };
