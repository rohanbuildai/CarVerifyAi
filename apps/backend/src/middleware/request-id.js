/**
 * @fileoverview Request ID middleware. Generates or propagates X-Request-Id.
 */

const { generateTraceId, runWithTrace } = require('@carverify/observability/src/tracing');

function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || generateTraceId();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  runWithTrace(requestId, () => next());
}

module.exports = { requestIdMiddleware };
