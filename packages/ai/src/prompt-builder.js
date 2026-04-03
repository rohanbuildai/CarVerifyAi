/**
 * @fileoverview Prompt builder for AI report generation.
 * Constructs system + user prompts from normalized vehicle data.
 * @module @carverify/ai
 */

const SYSTEM_PROMPT = `You are CarVerify AI, an expert automotive analyst specializing in the Indian used-car market.
You analyze vehicle data and provide clear, actionable risk assessments.

CRITICAL RULES:
1. ONLY use the provided data. Do NOT fabricate or assume information.
2. If data is missing or insufficient, explicitly state what is missing.
3. Reduce your confidence score when data is incomplete.
4. If overall data completeness is below 30%, refuse to give a verdict and say "Insufficient data for reliable assessment."
5. All monetary values must be in INR (₹).
6. Provide both English and Hindi for the verdict section.
7. Be direct, specific, and actionable in your recommendations.
8. Output ONLY valid JSON matching the provided schema.`;

/**
 * Build the user prompt for report generation.
 * @param {Object} params
 * @param {Object} params.vehicle - Vehicle details
 * @param {Array} params.ownershipRecords - Ownership history
 * @param {Array} params.insuranceClaims - Insurance claim signals
 * @param {Array} params.serviceRecords - Service records
 * @param {Array} params.partsSnapshots - Parts pricing data
 * @param {Object} params.riskScores - Pre-computed risk scores
 * @returns {string}
 */
function buildReportPrompt({ vehicle, ownershipRecords, insuranceClaims, serviceRecords, partsSnapshots, riskScores }) {
  const v = vehicle || {};

  const ownershipText = (ownershipRecords || []).length > 0
    ? ownershipRecords.map((o) => `- Owner #${o.ownerIndex}: ${o.ownerType || 'individual'}, ${o.state || 'unknown state'}, transferred ${o.transferDate ? new Date(o.transferDate).toLocaleDateString('en-IN') : 'unknown date'} (confidence: ${o.confidence || 'N/A'})`).join('\n')
    : 'No ownership records available.';

  const insuranceText = (insuranceClaims || []).length > 0
    ? insuranceClaims.map((c) => `- ${c.claimType || 'unknown'} claim, severity: ${c.severity || 'unknown'}, date: ${c.claimDate ? new Date(c.claimDate).toLocaleDateString('en-IN') : 'unknown'}, amount: ₹${c.claimAmount || 'N/A'} (confidence: ${c.confidence || 'N/A'})`).join('\n')
    : 'No insurance claim records available.';

  const serviceText = (serviceRecords || []).length > 0
    ? serviceRecords.map((s) => `- ${s.serviceType || 'unknown'}: ${s.description || 'N/A'}, date: ${s.serviceDate ? new Date(s.serviceDate).toLocaleDateString('en-IN') : 'unknown'}, cost: ₹${s.cost || 'N/A'}, odometer: ${s.odometerKm || 'N/A'} km`).join('\n')
    : 'No service records available.';

  const partsText = (partsSnapshots || []).length > 0
    ? partsSnapshots.map((p) => `- ${p.partName}: OEM ₹${p.oemPriceInr || 'N/A'}, aftermarket ₹${p.aftermktPrice || 'N/A'}, avg life: ${p.avgLifeKm || 'N/A'} km`).join('\n')
    : 'No parts pricing data available.';

  const dataSources = [
    ownershipRecords?.length > 0 ? 1 : 0,
    insuranceClaims?.length > 0 ? 1 : 0,
    serviceRecords?.length > 0 ? 1 : 0,
    partsSnapshots?.length > 0 ? 1 : 0,
  ];
  const dataCompleteness = dataSources.reduce((a, b) => a + b, 0) / dataSources.length;

  return `## Vehicle Data
Make/Model: ${v.make || 'Unknown'} ${v.model || ''} (${v.year || 'Unknown'})
VIN: ${v.vin || 'N/A'}
Registration: ${v.registrationNo || 'N/A'}
Fuel Type: ${v.fuelType || 'N/A'}
Color: ${v.color || 'N/A'}
Engine: ${v.engineCapacityCc || 'N/A'} cc
Body Type: ${v.bodyType || 'N/A'}
State: ${v.state || 'N/A'}
First Registered: ${v.firstRegisteredAt ? new Date(v.firstRegisteredAt).toLocaleDateString('en-IN') : 'N/A'}

## Ownership History
${ownershipText}

## Insurance Claim Signals
${insuranceText}

## Service Records
${serviceText}

## Parts Pricing
${partsText}

## Pre-Computed Risk Analysis
Overall Risk Score: ${riskScores?.overallRiskScore ?? 'N/A'}/100
Risk Verdict: ${riskScores?.riskVerdict ?? 'N/A'}
Estimated 1-Year Maintenance: ₹${riskScores?.maintenanceCost1y ?? 'N/A'}
Estimated 3-Year Maintenance: ₹${riskScores?.maintenanceCost3y ?? 'N/A'}
Data Completeness: ${Math.round(dataCompleteness * 100)}%

## Instructions
Generate a vehicle risk report as JSON with the following sections:
1. summary - Executive Summary (2-3 sentences)
2. ownership - Ownership Analysis
3. insurance - Accident & Insurance Risk Assessment
4. service - Service History Evaluation
5. maintenance - Maintenance Cost Projection
6. parts - Parts Pricing Benchmark
7. verdict - Final Verdict (BUY / CAUTION / AVOID recommendation)

Include both English and Hindi content for each section.
Output ONLY valid JSON — no markdown, no explanation.`;
}

module.exports = { buildReportPrompt, SYSTEM_PROMPT };
