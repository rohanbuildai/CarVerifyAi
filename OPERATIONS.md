# Operations Runbook

## Health Checks
- **Liveness**: `GET /api/v1/health` — returns 200 if process is alive
- **Readiness**: `GET /api/v1/ready` — returns 200 if DB + Redis connected, 503 if degraded
- **Metrics**: `GET /api/v1/metrics` — Prometheus-format metrics

## Key Metrics to Monitor
| Metric | Alert Threshold |
|--------|----------------|
| `carverify_http_request_duration_seconds` p99 | > 2s |
| `carverify_http_requests_total` 5xx rate | > 1% |
| `carverify_jobs_total{status="failed"}` | > 10/hour |
| `carverify_provider_latency_seconds` p99 | > 5s |
| Redis memory usage | > 80% |
| MySQL connections | > 80% of max |

## Common Issues

### Provider Timeouts
1. Check `vehicle_provider_results` for `status=timeout`
2. Verify provider API is accessible from worker pods
3. Increase `PROVIDER_TIMEOUT_MS` if needed
4. Check `failed_jobs` table for stuck jobs

### Payment Webhook Failures
1. Check `webhooks_received` table for unprocessed events
2. Verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard setting
3. Check backend logs for signature verification failures
4. Manually reprocess via admin API: `POST /api/v1/admin/failed-jobs/:id/retry`

### AI Report Generation Failures
1. Check `risk_reports` with `status=failed`
2. Verify `OPENAI_API_KEY` is valid and has quota
3. Check `failed_jobs` for `report-generation` queue
4. System falls back to rule-engine-only report automatically

### Database Performance
1. Check slow query log
2. Monitor connection pool usage (`DATABASE_POOL_SIZE`)
3. Cursor-based pagination prevents offset-scan issues
4. All frequently-queried columns are indexed

## Scheduled Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Payment Reconciliation | Every 1 hour | Mark stale orders as failed |
| Data Retention | Daily at 2 AM | Clean sessions, anonymize deleted users |
| Quota Reset | 1st of month | Reset monthly search/report quotas |

## Scaling Guides
- **Backend**: Scale horizontally (stateless). 2+ replicas recommended.
- **Worker**: Scale based on queue depth. HPA on CPU (70% target).
- **Redis**: Vertical scaling. Consider Redis Cluster at >10K concurrent users.
- **MySQL**: Read replicas for report queries. Vertical scaling for writes.
