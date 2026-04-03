/**
 * @fileoverview Report generation job — calls AI to generate narrative report sections.
 */

const { prisma } = require('@carverify/db');
const { QUERY_STATUS, REPORT_STATUS } = require('@carverify/shared');
const { generateReport } = require('@carverify/ai');
const { createLogger } = require('@carverify/observability');
const { reportsGenerated } = require('@carverify/observability/src/metrics');

const log = createLogger('job:report-generation');

async function processReportGeneration(job) {
  const { queryId, vehicleId } = job.data;

  const [report, vehicle, owners, claims, services, parts] = await Promise.all([
    prisma.riskReport.findUnique({ where: { queryId } }),
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.ownershipRecord.findMany({ where: { queryId } }),
    prisma.insuranceClaimSignal.findMany({ where: { queryId } }),
    prisma.serviceRecord.findMany({ where: { queryId } }),
    prisma.partsPriceSnapshot.findMany({ where: { queryId } }),
  ]);

  if (!report) {
    log.error({ queryId }, 'Risk report not found for generation');
    return;
  }

  await prisma.riskReport.update({ where: { id: report.id }, data: { status: REPORT_STATUS.GENERATING } });

  const riskScores = {
    overallRiskScore: report.overallRiskScore,
    riskVerdict: report.riskVerdict,
    maintenanceCost1y: report.maintenanceCost1y,
    maintenanceCost3y: report.maintenanceCost3y,
  };

  const aiResult = await generateReport({
    vehicle, ownershipRecords: owners, insuranceClaims: claims,
    serviceRecords: services, partsSnapshots: parts, riskScores,
  });

  if (aiResult && aiResult.sections) {
    // Create report sections from AI output
    const sectionOrder = ['summary', 'ownership', 'insurance', 'service', 'maintenance', 'parts', 'verdict'];

    for (const section of aiResult.sections) {
      const sortOrder = sectionOrder.indexOf(section.sectionType);
      const isFree = section.sectionType === 'summary' || section.sectionType === 'verdict';

      await prisma.reportSection.create({
        data: {
          reportId: report.id,
          sectionType: section.sectionType,
          titleEn: section.titleEn,
          titleHi: section.titleHi,
          contentEn: section.contentEn,
          contentHi: section.contentHi,
          sortOrder: sortOrder >= 0 ? sortOrder : 99,
          isFree,
        },
      });
    }

    // Extract verdict text
    const verdictSection = aiResult.sections.find((s) => s.sectionType === 'verdict');

    await prisma.riskReport.update({
      where: { id: report.id },
      data: {
        status: REPORT_STATUS.COMPLETED,
        modelVersion: aiResult.modelUsed || 'rule-engine-v1',
        generatedAt: new Date(),
        verdictEn: verdictSection?.contentEn || `Risk Score: ${report.overallRiskScore}/100. Verdict: ${report.riskVerdict}.`,
        verdictHi: verdictSection?.contentHi || null,
        dataCompleteness: aiResult.overallConfidence || report.dataCompleteness,
      },
    });
  } else {
    // Fallback: create rule-engine-only sections
    const fallbackSections = [
      { sectionType: 'summary', titleEn: 'Executive Summary', titleHi: 'कार्यकारी सारांश', contentEn: `This vehicle has a risk score of ${report.overallRiskScore}/100 (${report.riskVerdict}). Based on available data from ${owners.length} ownership records, ${claims.length} insurance claims, and ${services.length} service records.`, contentHi: `इस वाहन का जोखिम स्कोर ${report.overallRiskScore}/100 (${report.riskVerdict}) है।`, sortOrder: 0, isFree: true },
      { sectionType: 'verdict', titleEn: 'Final Verdict', titleHi: 'अंतिम निर्णय', contentEn: `Risk Level: ${report.riskVerdict.toUpperCase()}. Estimated 1-year maintenance: ₹${report.maintenanceCost1y?.toLocaleString()}. Estimated 3-year maintenance: ₹${report.maintenanceCost3y?.toLocaleString()}.`, contentHi: `जोखिम स्तर: ${report.riskVerdict}. अनुमानित वार्षिक रखरखाव: ₹${report.maintenanceCost1y?.toLocaleString()}.`, sortOrder: 6, isFree: true },
    ];

    for (const section of fallbackSections) {
      await prisma.reportSection.create({ data: { reportId: report.id, ...section } });
    }

    await prisma.riskReport.update({
      where: { id: report.id },
      data: {
        status: REPORT_STATUS.COMPLETED,
        modelVersion: 'rule-engine-v1',
        generatedAt: new Date(),
        verdictEn: fallbackSections[1].contentEn,
        verdictHi: fallbackSections[1].contentHi,
      },
    });
  }

  // Update query status
  await prisma.vehicleQuery.update({
    where: { id: queryId },
    data: { status: QUERY_STATUS.COMPLETED, completedAt: new Date() },
  });

  reportsGenerated.inc({ model_version: aiResult?.modelUsed || 'rule-engine-v1', risk_verdict: report.riskVerdict });
  log.info({ queryId, reportId: report.id }, 'Report generation complete');
}

module.exports = { processReportGeneration };
