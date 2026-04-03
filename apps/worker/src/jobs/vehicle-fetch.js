/**
 * @fileoverview Vehicle fetch job — calls a single provider and stores result.
 */

const { prisma } = require('@carverify/db');
const { fetchFromProvider } = require('@carverify/vehicle-providers');
const { createLogger } = require('@carverify/observability');
const { providerLatency } = require('@carverify/observability/src/metrics');
const { Queue } = require('bullmq');

const log = createLogger('job:vehicle-fetch');

/**
 * @param {import('bullmq').Job} job
 */
async function processVehicleFetch(job) {
  const { queryId, vehicleId, queryInput, queryType, providerType } = job.data;

  const result = await fetchFromProvider(providerType, { queryInput, queryType, vehicleId });

  // Record metrics
  providerLatency.observe(
    { provider: providerType, status: result.status },
    result.latencyMs / 1000
  );

  // Store provider result
  await prisma.vehicleProviderResult.create({
    data: {
      queryId,
      providerName: `mock-${providerType}`,
      providerType,
      status: result.status,
      rawPayload: result.data,
      normalizedData: result.data,
      confidenceScore: result.confidence,
      latencyMs: result.latencyMs,
      freshnessAt: result.freshnessAt,
      failureReason: result.failureReason,
      retryCount: job.attemptsMade,
    },
  });

  // Increment fetched count
  const query = await prisma.vehicleQuery.update({
    where: { id: queryId },
    data: { providersFetched: { increment: 1 } },
  });

  // If all providers done, enqueue normalization
  if (query.providersFetched >= query.providersTotal) {
    // Use the same Redis connection via BullMQ
    const normQueue = new Queue('normalization', { connection: job.queue?.opts?.connection });
    await normQueue.add('normalize', { queryId, vehicleId });
    await normQueue.close();
    log.info({ queryId }, 'All providers done, normalization enqueued');
  }
}

module.exports = { processVehicleFetch };
