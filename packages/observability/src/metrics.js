/**
 * @fileoverview Prometheus metrics for HTTP, queues, and business KPIs.
 * @module @carverify/observability
 */

const promClient = require('prom-client');

// Collect default Node.js metrics
promClient.collectDefaultMetrics({ prefix: 'carverify_' });

const httpRequestDuration = new promClient.Histogram({
  name: 'carverify_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'carverify_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const jobDuration = new promClient.Histogram({
  name: 'carverify_job_duration_seconds',
  help: 'Duration of background jobs',
  labelNames: ['queue', 'status'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
});

const jobsTotal = new promClient.Counter({
  name: 'carverify_jobs_total',
  help: 'Total number of background jobs processed',
  labelNames: ['queue', 'status'],
});

const providerLatency = new promClient.Histogram({
  name: 'carverify_provider_latency_seconds',
  help: 'Latency of external provider calls',
  labelNames: ['provider', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const reportsGenerated = new promClient.Counter({
  name: 'carverify_reports_generated_total',
  help: 'Total reports generated',
  labelNames: ['model_version', 'risk_verdict'],
});

const paymentsProcessed = new promClient.Counter({
  name: 'carverify_payments_processed_total',
  help: 'Total payments processed',
  labelNames: ['type', 'status'],
});

const activeUsers = new promClient.Gauge({
  name: 'carverify_active_users',
  help: 'Number of active user sessions',
});

/**
 * Express middleware to record request metrics.
 */
function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path || 'unknown';
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });
  next();
}

/**
 * Get metrics output for Prometheus scraping.
 * @returns {Promise<string>}
 */
async function getMetrics() {
  return promClient.register.metrics();
}

module.exports = {
  httpRequestDuration, httpRequestsTotal, jobDuration, jobsTotal,
  providerLatency, reportsGenerated, paymentsProcessed, activeUsers,
  metricsMiddleware, getMetrics, promClient,
};
