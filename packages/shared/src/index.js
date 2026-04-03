/**
 * @fileoverview Shared domain constants, error classes, and Zod schemas.
 * @module @carverify/shared
 */

const { z } = require('zod');

// ── Constants ──────────────────────────────────────────────

const ROLES = { USER: 'user', ADMIN: 'admin', SUPPORT: 'support' };
const USER_STATUS = { ACTIVE: 'active', SUSPENDED: 'suspended', DELETED: 'deleted' };
const QUERY_STATUS = { PENDING: 'pending', PROCESSING: 'processing', COMPLETED: 'completed', FAILED: 'failed', PARTIAL: 'partial' };
const REPORT_STATUS = { PENDING: 'pending', GENERATING: 'generating', COMPLETED: 'completed', FAILED: 'failed' };
const RISK_VERDICT = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' };
const PAYMENT_STATUS = { CREATED: 'created', PAID: 'paid', FAILED: 'failed', REFUNDED: 'refunded' };
const SUB_STATUS = { ACTIVE: 'active', PAST_DUE: 'past_due', CANCELLED: 'cancelled', EXPIRED: 'expired' };
const SUB_PLAN = { FREE: 'free', MONTHLY: 'monthly', ANNUAL: 'annual' };
const QUERY_TYPE = { VIN: 'vin', REGISTRATION: 'registration', CHASSIS: 'chassis' };
const PROVIDER_TYPE = { RTO: 'rto', INSURANCE: 'insurance', SERVICE: 'service', PARTS: 'parts' };
const PROVIDER_STATUS = { SUCCESS: 'success', FAILED: 'failed', TIMEOUT: 'timeout', PARTIAL: 'partial' };

const PLAN_LIMITS = {
  [SUB_PLAN.FREE]: { reportsPerMonth: 0, searchesPerMonth: 3, chatMessages: 0 },
  [SUB_PLAN.MONTHLY]: { reportsPerMonth: 15, searchesPerMonth: 100, chatMessages: -1 },
  [SUB_PLAN.ANNUAL]: { reportsPerMonth: 20, searchesPerMonth: 200, chatMessages: -1 },
};

// ── Error Classes ──────────────────────────────────────────

class AppError extends Error {
  /** @param {string} message @param {number} statusCode @param {string} code */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required', upgradeUrl = '/pricing') {
    super(message, 402, 'PAYMENT_REQUIRED');
    this.name = 'PaymentRequiredError';
    this.upgradeUrl = upgradeUrl;
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// ── Zod Schemas ────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().optional(),
  preferredLang: z.enum(['en', 'hi']).optional().default('en'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const vehicleSearchSchema = z.object({
  queryInput: z.string().min(3).max(50).transform((v) => v.toUpperCase().replace(/\s/g, '')),
  queryType: z.enum(['vin', 'registration', 'chassis']),
  idempotencyKey: z.string().min(8).max(128),
});

const chatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  language: z.enum(['en', 'hi']).optional().default('en'),
});

const createOrderSchema = z.object({
  type: z.enum(['one_time_report']),
  reportId: z.string().min(1),
  idempotencyKey: z.string().min(8).max(128),
});

const createSubscriptionSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

const paginationSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
});

module.exports = {
  ROLES, USER_STATUS, QUERY_STATUS, REPORT_STATUS, RISK_VERDICT,
  PAYMENT_STATUS, SUB_STATUS, SUB_PLAN, QUERY_TYPE, PROVIDER_TYPE,
  PROVIDER_STATUS, PLAN_LIMITS,
  AppError, ValidationError, AuthError, ForbiddenError, NotFoundError,
  ConflictError, PaymentRequiredError, RateLimitError,
  registerSchema, loginSchema, vehicleSearchSchema, chatMessageSchema,
  createOrderSchema, createSubscriptionSchema, paginationSchema,
};
