/**
 * @fileoverview Data retention job — cleanup expired sessions, anonymize deleted users.
 */

const { prisma } = require('@carverify/db');
const { createLogger } = require('@carverify/observability');

const log = createLogger('job:data-retention');

async function processDataRetention(job) {
  const now = new Date();
  let totalAffected = 0;

  // 1. Delete expired sessions
  const expiredSessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  totalAffected += expiredSessions.count;
  log.info({ count: expiredSessions.count }, 'Expired sessions cleaned');

  // 2. Delete expired idempotency keys
  const expiredKeys = await prisma.idempotencyKey.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  totalAffected += expiredKeys.count;

  // 3. Anonymize users deleted > 30 days ago
  const deletionThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const deletedUsers = await prisma.user.findMany({
    where: {
      status: 'deleted',
      deletedAt: { lt: deletionThreshold },
      email: { not: { startsWith: 'deleted_' } },
    },
    take: 50,
  });

  for (const user of deletedUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted_${user.id}@anonymized.local`,
        name: 'Deleted User',
        phone: null,
        passwordHash: 'ANONYMIZED',
      },
    });
    totalAffected++;
  }

  // Record retention job
  await prisma.dataRetentionJob.create({
    data: {
      jobType: 'periodic_cleanup',
      status: 'completed',
      recordsAffected: totalAffected,
      startedAt: now,
      completedAt: new Date(),
    },
  });

  log.info({ totalAffected }, 'Data retention job complete');
}

module.exports = { processDataRetention };
