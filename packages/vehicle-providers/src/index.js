/**
 * @fileoverview Provider abstraction layer — registry and execution.
 * @module @carverify/vehicle-providers
 */

const { createLogger } = require('@carverify/observability');
const { mockRtoProvider } = require('./providers/mock-rto');
const { mockInsuranceProvider } = require('./providers/mock-insurance');
const { mockServiceProvider } = require('./providers/mock-service');
const { mockPartsProvider } = require('./providers/mock-parts');

const log = createLogger('vehicle-providers');

const PROVIDER_REGISTRY = {
  rto: mockRtoProvider,
  insurance: mockInsuranceProvider,
  service: mockServiceProvider,
  parts: mockPartsProvider,
};

/**
 * Fetch data from a specific provider.
 * @param {string} providerType - rto | insurance | service | parts
 * @param {Object} params - { queryInput, queryType, vehicleId }
 * @returns {Promise<{ data: any, confidence: number, freshnessAt: Date, latencyMs: number, status: string, failureReason?: string }>}
 */
async function fetchFromProvider(providerType, params) {
  const provider = PROVIDER_REGISTRY[providerType];
  if (!provider) {
    return { data: null, confidence: 0, freshnessAt: new Date(), latencyMs: 0, status: 'failed', failureReason: `Unknown provider: ${providerType}` };
  }

  const startTime = Date.now();
  try {
    const result = await provider.fetch(params);
    const latencyMs = Date.now() - startTime;

    return {
      data: result.data,
      confidence: result.confidence,
      freshnessAt: new Date(),
      latencyMs,
      status: 'success',
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    log.error({ err, providerType, latencyMs }, 'Provider fetch failed');

    return {
      data: null,
      confidence: 0,
      freshnessAt: new Date(),
      latencyMs,
      status: err.message?.includes('timeout') ? 'timeout' : 'failed',
      failureReason: err.message,
    };
  }
}

/**
 * Get all registered provider types.
 * @returns {string[]}
 */
function getProviderTypes() {
  return Object.keys(PROVIDER_REGISTRY);
}

module.exports = { fetchFromProvider, getProviderTypes, PROVIDER_REGISTRY };
