/**
 * @fileoverview Lightweight request tracing via correlation IDs.
 * Full distributed tracing (OpenTelemetry) can replace this later.
 * @module @carverify/observability
 */

const crypto = require('crypto');

/**
 * Generate a unique trace/request ID.
 * @returns {string}
 */
function generateTraceId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * AsyncLocalStorage-based context for passing request IDs through async chains.
 * Node 16+ required.
 */
const { AsyncLocalStorage } = require('async_hooks');
const traceStorage = new AsyncLocalStorage();

/**
 * Run a function within a trace context.
 * @param {string} traceId
 * @param {Function} fn
 */
function runWithTrace(traceId, fn) {
  return traceStorage.run({ traceId }, fn);
}

/**
 * Get current trace ID from async context.
 * @returns {string | undefined}
 */
function getTraceId() {
  return traceStorage.getStore()?.traceId;
}

module.exports = { generateTraceId, runWithTrace, getTraceId, traceStorage };
