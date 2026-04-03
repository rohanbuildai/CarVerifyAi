/**
 * @fileoverview Razorpay client factory.
 * @module @carverify/payments
 */

const Razorpay = require('razorpay');
const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');

const log = createLogger('razorpay');

let _client = null;

/**
 * Create or return cached Razorpay client.
 * @returns {Razorpay}
 */
function createRazorpayClient() {
  if (_client) return _client;

  const env = getEnv();

  _client = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

  log.info('Razorpay client initialized');
  return _client;
}

module.exports = { createRazorpayClient };
