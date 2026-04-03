/**
 * @fileoverview Razorpay webhook signature verification.
 * @module @carverify/payments
 */

const crypto = require('crypto');
const { getEnv } = require('@carverify/config');

/**
 * Verify Razorpay webhook signature.
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  const env = getEnv();
  const expectedSig = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(typeof rawBody === 'string' ? rawBody : rawBody.toString())
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );
}

/**
 * Verify Razorpay payment signature (for client-side verification).
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean}
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  const env = getEnv();
  const body = `${orderId}|${paymentId}`;
  const expectedSig = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSig === signature;
}

module.exports = { verifyWebhookSignature, verifyPaymentSignature };
