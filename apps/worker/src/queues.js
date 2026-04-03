/**
 * @fileoverview Queue definitions and worker registration.
 */

const { Worker } = require('bullmq');
const { createLogger } = require('@carverify/observability');
const { jobDuration, jobsTotal } = require('@carverify/observability/src/metrics');
const { prisma } = require('@carverify/db');
const { processVehicleFetch } = require('./jobs/vehicle-fetch');
const { processNormalization } = require('./jobs/normalization');
const { processRiskScoring } = require('./jobs/risk-scoring');
const { processReportGeneration } = require('./jobs/report-generation');
const { processPaymentReconciliation } = require('./jobs/payment-reconciliation');
const { processDataRetention } = require('./jobs/data-retention');

const log = createLogger('queues');

const QUEUE_CONFIG = {
  'vehicle-fetch':        { concurrency: 10, processor: processVehicleFetch },
  'normalization':        { concurrency: 5,  processor: processNormalization },
  'risk-scoring':         { concurrency: 5,  processor: processRiskScoring },
  'report-generation':    { concurrency: 3,  processor: processReportGeneration },
  'payment-reconciliation': { concurrency: 2, processor: processPaymentReconciliation },
  'data-retention':       { concurrency: 1,  processor: processDataRetention },
};

/**
 * Register all BullMQ workers.
 * @param {import('ioredis').Redis} redis
 * @returns {import('bullmq').Worker[]}
 */
function registerWorkers(redis) {
  const workers = [];

  for (const [queueName, config] of Object.entries(QUEUE_CONFIG)) {
    const worker = new Worker(queueName, async (job) => {
      const start = Date.now();
      log.info({ queue: queueName, jobId: job.id, jobName: job.name }, 'Processing job');

      try {
        await config.processor(job);
        const duration = (Date.now() - start) / 1000;
        jobDuration.observe({ queue: queueName, status: 'completed' }, duration);
        jobsTotal.inc({ queue: queueName, status: 'completed' });
        log.info({ queue: queueName, jobId: job.id, durationMs: Date.now() - start }, 'Job completed');
      } catch (err) {
        const duration = (Date.now() - start) / 1000;
        jobDuration.observe({ queue: queueName, status: 'failed' }, duration);
        jobsTotal.inc({ queue: queueName, status: 'failed' });
        log.error({ err, queue: queueName, jobId: job.id }, 'Job failed');

        // Log to failed_jobs table on final failure
        if (job.attemptsMade >= (job.opts?.attempts || 3) - 1) {
          try {
            await prisma.failedJob.create({
              data: {
                queueName,
                jobId: job.id,
                jobData: job.data,
                error: err.message,
                stackTrace: err.stack,
                retryCount: job.attemptsMade,
              },
            });
          } catch (dbErr) {
            log.error({ dbErr }, 'Failed to log failed job');
          }
        }

        throw err;
      }
    }, {
      connection: redis,
      concurrency: config.concurrency,
    });

    worker.on('error', (err) => log.error({ err, queue: queueName }, 'Worker error'));
    workers.push(worker);
  }

  return workers;
}

module.exports = { registerWorkers, QUEUE_CONFIG };
