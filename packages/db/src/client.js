/**
 * @fileoverview Singleton Prisma client with connection pool configuration.
 * Prevents multiple instances in development hot-reloading.
 * @module @carverify/db
 */

const { PrismaClient } = require('@prisma/client');

/** @type {PrismaClient} */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });
} else {
  // Prevent multiple instances in dev (hot reload)
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    });
  }
  prisma = global.__prisma;
}

module.exports = { prisma };
