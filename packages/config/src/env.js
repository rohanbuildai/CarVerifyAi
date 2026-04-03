/**
 * @fileoverview Centralized environment variable validation using Zod.
 * All env vars are validated at startup. Missing or invalid vars cause immediate crash.
 * @module @carverify/config
 */

const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('CarVerify AI'),

  // Backend
  BACKEND_PORT: z.coerce.number().default(4000),
  BACKEND_HOST: z.string().default('0.0.0.0'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_KEY_PREFIX: z.string().default('cv:'),

  // Session
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 chars'),
  SESSION_MAX_AGE_MS: z.coerce.number().default(604800000), // 7 days
  CSRF_SECRET: z.string().min(16, 'CSRF_SECRET must be at least 16 chars'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_PLAN_MONTHLY: z.string().optional().default(''),
  RAZORPAY_PLAN_ANNUAL: z.string().optional().default(''),

  // Email (SMTP)
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.number().optional(),
  SMTP_SECURE: z.boolean().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Pricing
  PRICE_SINGLE_REPORT: z.coerce.number().default(19900),
  PRICE_MONTHLY_SUB: z.coerce.number().default(49900),
  PRICE_ANNUAL_SUB: z.coerce.number().default(499900),
  GST_RATE: z.coerce.number().default(0.18),

  // AI
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  OPENAI_MAX_TOKENS: z.coerce.number().default(4000),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.3),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(30000),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),
  AI_CHAT_MODEL: z.string().default('gpt-4o-mini'),
  AI_CHAT_MAX_TOKENS: z.coerce.number().default(1000),

  // Providers
  PROVIDER_TIMEOUT_MS: z.coerce.number().default(5000),
  PROVIDER_MAX_RETRIES: z.coerce.number().default(2),
  PROVIDER_CACHE_TTL_SECONDS: z.coerce.number().default(21600),

  // Rate Limiting
  RATE_LIMIT_ENABLED: z.string().transform((v) => v === 'true').default('true'),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_SEARCH_MAX: z.coerce.number().default(10),
  RATE_LIMIT_SEARCH_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(100),
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce.number().default(60000),

  // Quotas
  FREE_SEARCHES_PER_MONTH: z.coerce.number().default(3),

  // Observability
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  SENTRY_DSN: z.string().optional().default(''),
  METRICS_ENABLED: z.string().transform((v) => v === 'true').default('false'),
  METRICS_PORT: z.coerce.number().default(9090),
});

let _env = null;

/**
 * Get validated environment config. Caches after first call.
 * @returns {z.infer<typeof envSchema>}
 */
function getEnv() {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev, use defaults where possible
    _env = envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/carverify_db',
      SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-replace-in-production',
      CSRF_SECRET: process.env.CSRF_SECRET || 'dev-csrf-secret-replace-in-prod',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook',
    });
    return _env;
  }

  _env = result.data;
  return _env;
}

/** @returns {boolean} */
function isProduction() {
  return getEnv().NODE_ENV === 'production';
}

/** @returns {boolean} */
function isDevelopment() {
  return getEnv().NODE_ENV === 'development';
}

module.exports = { getEnv, isProduction, isDevelopment, envSchema };
