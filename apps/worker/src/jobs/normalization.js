/**
 * @fileoverview Normalization job — merges provider results into structured records.
 */

const { prisma } = require('@carverify/db');
const { createLogger } = require('@carverify/observability');
const { Queue } = require('bullmq');

const log = createLogger('job:normalization');

async function processNormalization(job) {
  const { queryId, vehicleId } = job.data;

  const providerResults = await prisma.vehicleProviderResult.findMany({
    where: { queryId, status: 'success' },
  });

  // Extract and merge data from each provider type
  for (const result of providerResults) {
    const data = result.normalizedData;
    if (!data) continue;

    switch (result.providerType) {
      case 'rto': {
        // Update vehicle with RTO data
        if (data.make) {
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
              make: data.make, model: data.model, year: data.year,
              fuelType: data.fuelType, color: data.color,
              engineCapacityCc: data.engineCapacityCc, bodyType: data.bodyType,
              state: data.state, rtoCode: data.rtoCode,
            },
          });
        }
        // Create ownership records
        if (data.owners) {
          for (const owner of data.owners) {
            await prisma.ownershipRecord.create({
              data: {
                queryId, ownerIndex: owner.ownerIndex,
                ownerType: owner.ownerType, state: owner.state,
                city: owner.city,
                transferDate: owner.transferDate ? new Date(owner.transferDate) : null,
                source: result.providerName,
                confidence: result.confidenceScore,
              },
            });
          }
        }
        break;
      }

      case 'insurance': {
        if (data.claims) {
          for (const claim of data.claims) {
            await prisma.insuranceClaimSignal.create({
              data: {
                queryId, claimType: claim.claimType,
                severity: claim.severity,
                claimDate: claim.claimDate ? new Date(claim.claimDate) : null,
                claimAmount: claim.claimAmount, settled: claim.settled,
                source: result.providerName,
                confidence: result.confidenceScore,
              },
            });
          }
        }
        break;
      }

      case 'service': {
        if (data.records) {
          for (const rec of data.records) {
            await prisma.serviceRecord.create({
              data: {
                queryId, serviceType: rec.serviceType,
                description: rec.description,
                serviceDate: rec.serviceDate ? new Date(rec.serviceDate) : null,
                odometerKm: rec.odometerKm, cost: rec.cost,
                source: result.providerName,
                confidence: result.confidenceScore,
              },
            });
          }
        }
        break;
      }

      case 'parts': {
        if (data.parts) {
          for (const part of data.parts) {
            await prisma.partsPriceSnapshot.create({
              data: {
                queryId, partName: part.partName,
                category: part.category,
                oemPriceInr: part.oemPriceInr,
                aftermktPrice: part.aftermktPrice,
                avgLifeKm: part.avgLifeKm,
                source: result.providerName,
                confidence: result.confidenceScore,
              },
            });
          }
        }
        break;
      }
    }
  }

  // Chain to risk scoring
  const riskQueue = new Queue('risk-scoring', { connection: job.queue?.opts?.connection });
  await riskQueue.add('score', { queryId, vehicleId });
  await riskQueue.close();

  log.info({ queryId }, 'Normalization complete, risk scoring enqueued');
}

module.exports = { processNormalization };
