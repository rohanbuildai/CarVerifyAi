/**
 * @fileoverview Worker entry point. Starts all BullMQ workers.
 */

const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');
const Redis = require('ioredis');
const { registerWorkers } = require('./queues');

const log = createLogger('worker');
const env = getEnv();

async function main() {
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on('connect', () => log.info('Worker Redis connected'));
  redis.on('error', (err) => log.error({ err }, 'Worker Redis error'));

  const workers = registerWorkers(redis);

  log.info({ workerCount: workers.length, env: env.NODE_ENV }, 'Worker service started');

  // Graceful shutdown
  const shutdown = async (signal) => {
    log.info({ signal }, 'Worker shutdown signal received');
    await Promise.allSettled(workers.map((w) => w.close()));
    await redis.quit();
    log.info('Worker shut down cleanly');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => log.error({ reason }, 'Unhandled rejection in worker'));
  process.on('uncaughtException', (err) => {
    log.fatal({ err }, 'Uncaught exception in worker');
    shutdown('uncaughtException');
  });
}

main().catch((err) => {
  console.error('Failed to start worker:', err);
  process.exit(1);
});
