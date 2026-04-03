# Security Architecture

## Authentication
- **Method**: HttpOnly secure cookies with server-side sessions stored in Redis
- **Password hashing**: argon2id (memory=64MB, time=3, parallelism=4)
- **Session tokens**: crypto.randomBytes(32) — 256-bit entropy
- **Max sessions**: 5 per user (oldest evicted)

## Cookie Configuration
| Flag | Value | Purpose |
|------|-------|---------|
| HttpOnly | true | Prevents XSS access |
| Secure | true (production) | HTTPS only |
| SameSite | Lax | CSRF prevention |
| Path | / | All routes |
| Max-Age | 7 days | Session duration |

## Security Headers
Applied via Helmet.js and Nginx:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` (configured per environment)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 | 15 min |
| Register | 3 | 1 hour |
| Search | 10 | 1 min |
| Chat | 20 | 1 min |
| Global | 100 | 1 min |

## Input Validation
- All API inputs validated with Zod schemas
- All LLM outputs validated with Zod schemas
- All webhook payloads signature-verified before processing

## Webhook Security
- HMAC-SHA256 signature verification
- Idempotency keys prevent replay attacks
- Events older than 5 minutes rejected
- All webhooks logged to `webhooks_received` table

## RBAC
| Role | Permissions |
|------|-------------|
| user | search, report:read (own), chat, billing, profile |
| support | report:read (any), user:read |
| admin | all permissions |

## Data Protection
- PII redacted from all logs (passwords, tokens, emails)
- User deletion: soft delete → 30-day grace → hard anonymization
- Database encrypted at rest (managed MySQL)
- All traffic encrypted in transit (TLS 1.2+)

## Incident Response
1. Sentry alerts on 5xx error spike
2. Check `/api/v1/health` and `/api/v1/ready` endpoints
3. Review structured logs in logging system
4. Check `failed_jobs` table for background job failures
5. Check `audit_logs` for suspicious activity
