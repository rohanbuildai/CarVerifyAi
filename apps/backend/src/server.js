/**
 * @fileoverview Server entry point. Initializes Redis, BullMQ queues, and starts HTTP server.
 * Handles graceful shutdown of all resources.
 * @module backend/server
 */

const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');
const { prisma } = require('@carverify/db');
const Redis = require('ioredis');
const { Queue } = require('bullmq');
const { createApp } = require('./app');

const log = createLogger('server');
const env = getEnv();

async function main() {
  // ── Redis connection ────────────────────────────────────
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    lazyConnect: false,
  });

  redis.on('connect', () => log.info('Redis connected'));
  redis.on('error', (err) => log.error({ err }, 'Redis error'));

  // ── BullMQ Queues (producer side) ──────────────────────
  const connection = { connection: redis };
  const queues = {
    vehicleFetch: new Queue('vehicle-fetch', connection),
    normalization: new Queue('normalization', connection),
    riskScoring: new Queue('risk-scoring', connection),
    reportGeneration: new Queue('report-generation', connection),
    paymentReconciliation: new Queue('payment-reconciliation', connection),
    dataRetention: new Queue('data-retention', connection),
  };

  // ── Create Express app ─────────────────────────────────
  const app = createApp({ redis, queues });

  // ── Start HTTP server ──────────────────────────────────
  const server = app.listen(env.BACKEND_PORT, env.BACKEND_HOST, () => {
    log.info({ port: env.BACKEND_PORT, host: env.BACKEND_HOST, env: env.NODE_ENV }, 'Backend API server started');
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // ── Graceful shutdown ──────────────────────────────────
  const shutdown = async (signal) => {
    log.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
      log.info('HTTP server closed');
      try {
        await Promise.allSettled([
          ...Object.values(queues).map((q) => q.close()),
          redis.quit(),
          prisma.$disconnect(),
        ]);
        log.info('All connections closed');
        process.exit(0);
      } catch (err) {
        log.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });

    // Force exit after 15 seconds
    setTimeout(() => {
      log.error('Forced shutdown after timeout');
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    log.error({ reason }, 'Unhandled rejection');
  });
  process.on('uncaughtException', (err) => {
    log.fatal({ err }, 'Uncaught exception — shutting down');
    shutdown('uncaughtException');
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
