/**
 * @fileoverview Audit logging helper. Writes audit events to the database.
 * @module @carverify/security
 */

const { prisma } = require('@carverify/db');
const { createLogger } = require('@carverify/observability');
const log = createLogger('audit');

/**
 * Log an audit event.
 * @param {Object} params
 * @param {string} [params.userId]
 * @param {string} params.action - e.g. 'user.login', 'report.generated'
 * @param {string} [params.resource] - e.g. 'user', 'report'
 * @param {string} [params.resourceId]
 * @param {Object} [params.metadata]
 * @param {string} [params.ipAddress]
 * @param {string} [params.userAgent]
 */
async function auditLog({ userId, action, resource, resourceId, metadata, ipAddress, userAgent }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, resource, resourceId, metadata, ipAddress, userAgent },
    });
  } catch (err) {
    // Never let audit logging failures break the request
    log.error({ err, action, userId }, 'Failed to write audit log');
  }
}

/**
 * Create audit log from Express request context.
 * @param {import('express').Request} req
 * @param {string} action
 * @param {Object} [extra]
 */
async function auditFromReq(req, action, extra = {}) {
  await auditLog({
    userId: req.user?.id,
    action,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    ...extra,
  });
}

module.exports = { auditLog, auditFromReq };
