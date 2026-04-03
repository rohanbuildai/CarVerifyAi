/**
 * @fileoverview HTTP API client for communicating with the CarVerify backend.
 * All requests include credentials (cookies) for session auth.
 * Provides typed error handling and response normalization.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Custom API error with status code and structured error body.
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {{ code?: string, message?: string, details?: any[] }} body - Error body
   */
  constructor(status, body = {}) {
    super(body.message || body.error?.message || `API Error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code || body.error?.code || 'UNKNOWN_ERROR';
    this.details = body.details || body.error?.details || [];
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isPaymentRequired() {
    return this.status === 402;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get isValidationError() {
    return this.status === 400;
  }
}

/**
 * Makes an HTTP request to the backend API.
 * @param {string} method - HTTP method
 * @param {string} path - API path (appended to base URL)
 * @param {Object} [options]
 * @param {any} [options.body] - Request body (will be JSON stringified)
 * @param {Record<string, string>} [options.headers] - Additional headers
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<any>} Parsed JSON response
 * @throws {ApiError} On non-2xx responses
 */
async function request(method, path, { body, headers, signal } = {}) {
  const url = `${API_BASE}${path}`;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    credentials: 'include',
    signal,
  };

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(0, { message: 'Network error. Please check your connection.' });
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiError(res.status, { message: `HTTP ${res.status}` });
    }
    return null;
  }

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data;
}

/**
 * API client with convenience methods for each HTTP verb.
 */
export const apiClient = {
  /** @param {string} path */
  get: (path, options) => request('GET', path, options),

  /** @param {string} path @param {any} body */
  post: (path, body, options) => request('POST', path, { ...options, body }),

  /** @param {string} path @param {any} body */
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),

  /** @param {string} path @param {any} body */
  put: (path, body, options) => request('PUT', path, { ...options, body }),

  /** @param {string} path */
  delete: (path, options) => request('DELETE', path, options),
};

// ── Domain-specific API methods ──────────────────────────────

/** Auth APIs */
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

/** Vehicle APIs */
export const vehicleApi = {
  search: (data) => apiClient.post('/vehicles/search', data),
  getQuery: (queryId) => apiClient.get(`/vehicles/queries/${queryId}`),
  listQueries: (cursor) =>
    apiClient.get(`/vehicles/queries${cursor ? `?cursor=${cursor}` : ''}`),
};

/** Report APIs */
export const reportApi = {
  get: (reportId) => apiClient.get(`/reports/${reportId}`),
  getSections: (reportId) => apiClient.get(`/reports/${reportId}/sections`),
};

/** Chat APIs */
export const chatApi = {
  createConversation: (reportId) =>
    apiClient.post('/chat/conversations', { reportId }),
  getConversation: (convId) => apiClient.get(`/chat/conversations/${convId}`),
  sendMessage: (convId, data) =>
    apiClient.post(`/chat/conversations/${convId}/messages`, data),
};

/** Payment APIs */
export const paymentApi = {
  createOrder: (data) => apiClient.post('/payments/orders', data),
  createSubscription: (data) => apiClient.post('/payments/subscriptions', data),
  listOrders: () => apiClient.get('/payments/orders'),
  getCurrentSubscription: () => apiClient.get('/payments/subscriptions/current'),
  cancelSubscription: () => apiClient.post('/payments/subscriptions/cancel'),
};

/** Admin APIs */
export const adminApi = {
  listUsers: (cursor) =>
    apiClient.get(`/admin/users${cursor ? `?cursor=${cursor}` : ''}`),
  getUser: (userId) => apiClient.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => apiClient.patch(`/admin/users/${userId}`, data),
  listReports: (cursor) =>
    apiClient.get(`/admin/reports${cursor ? `?cursor=${cursor}` : ''}`),
  listPayments: (cursor) =>
    apiClient.get(`/admin/payments${cursor ? `?cursor=${cursor}` : ''}`),
  issueRefund: (data) => apiClient.post('/admin/refunds', data),
  listFailedJobs: () => apiClient.get('/admin/failed-jobs'),
  retryFailedJob: (jobId) => apiClient.post(`/admin/failed-jobs/${jobId}/retry`),
  getFeatureFlags: () => apiClient.get('/admin/feature-flags'),
  updateFeatureFlag: (key, data) =>
    apiClient.patch(`/admin/feature-flags/${key}`, data),
  getStats: () => apiClient.get('/admin/stats'),
};
