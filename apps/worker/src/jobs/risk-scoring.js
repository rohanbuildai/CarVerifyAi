/**
 * @fileoverview Risk scoring job — deterministic rule engine.
 */

const { prisma } = require('@carverify/db');
const { RISK_VERDICT } = require('@carverify/shared');
const { createLogger } = require('@carverify/observability');
const { Queue } = require('bullmq');

const log = createLogger('job:risk-scoring');

async function processRiskScoring(job) {
  const { queryId, vehicleId } = job.data;

  const [owners, claims, services, parts, vehicle] = await Promise.all([
    prisma.ownershipRecord.findMany({ where: { queryId } }),
    prisma.insuranceClaimSignal.findMany({ where: { queryId } }),
    prisma.serviceRecord.findMany({ where: { queryId }, orderBy: { serviceDate: 'asc' } }),
    prisma.partsPriceSnapshot.findMany({ where: { queryId } }),
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
  ]);

  let score = 0;

  // Ownership risk
  if (owners.length > 3) score += 20;
  else if (owners.length > 2) score += 10;
  else if (owners.length > 1) score += 5;

  // Accident / insurance risk
  for (const claim of claims) {
    if (claim.severity === 'total_loss') score += 50;
    else if (claim.severity === 'major') score += 30;
    else if (claim.severity === 'moderate') score += 15;
    else score += 5;
  }

  // Service gap risk
  if (services.length >= 2) {
    const lastService = services[services.length - 1];
    const prevService = services[services.length - 2];
    if (lastService.serviceDate && prevService.serviceDate) {
      const gapMs = new Date(lastService.serviceDate) - new Date(prevService.serviceDate);
      const gapMonths = gapMs / (1000 * 60 * 60 * 24 * 30);
      if (gapMonths > 24) score += 20;
      else if (gapMonths > 12) score += 10;
    }
  }

  // Mileage vs age anomaly
  if (vehicle?.year && services.length > 0) {
    const lastOdometer = services[services.length - 1]?.odometerKm;
    if (lastOdometer) {
      const ageYears = new Date().getFullYear() - vehicle.year;
      const expectedKm = ageYears * 12000;
      if (lastOdometer > expectedKm * 1.5) score += 15;
      if (lastOdometer < expectedKm * 0.3 && ageYears > 3) score += 10;
    }
  }

  // Flood damage
  if (claims.some((c) => c.claimType === 'flood')) score += 25;

  score = Math.min(score, 100);

  // Determine verdict
  let verdict;
  if (score <= 25) verdict = RISK_VERDICT.LOW;
  else if (score <= 50) verdict = RISK_VERDICT.MEDIUM;
  else if (score <= 75) verdict = RISK_VERDICT.HIGH;
  else verdict = RISK_VERDICT.CRITICAL;

  // Maintenance cost estimation
  const totalPartsCost = parts.reduce((sum, p) => sum + (p.oemPriceInr || 0), 0);
  const maintenanceCost1y = Math.round(totalPartsCost * 0.15 + 5000);
  const maintenanceCost3y = Math.round(totalPartsCost * 0.4 + 15000);

  // Data completeness
  const dataSources = [owners.length > 0, claims.length > 0, services.length > 0, parts.length > 0];
  const dataCompleteness = dataSources.filter(Boolean).length / dataSources.length;

  // Create risk report
  await prisma.riskReport.create({
    data: {
      queryId,
      overallRiskScore: score,
      riskVerdict: verdict,
      maintenanceCost1y,
      maintenanceCost3y,
      dataCompleteness,
      modelVersion: 'rule-engine-v1',
      status: 'pending',
    },
  });

  // Chain to report generation
  const reportQueue = new Queue('report-generation', { connection: job.queue?.opts?.connection });
  await reportQueue.add('generate', { queryId, vehicleId });
  await reportQueue.close();

  log.info({ queryId, score, verdict }, 'Risk scoring complete');
}

module.exports = { processRiskScoring };
