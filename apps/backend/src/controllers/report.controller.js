/**
 * @fileoverview Report controller — get report, get sections.
 */

const { prisma } = require('@carverify/db');
const { NotFoundError, ForbiddenError } = require('@carverify/shared');

const reportController = {
  /**
   * GET /reports/:reportId
   */
  async getReport(req, res) {
    const { reportId } = req.params;

    const report = await prisma.riskReport.findUnique({
      where: { id: reportId },
      include: {
        query: { select: { userId: true, queryInput: true, vehicle: true } },
        sections: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!report) throw new NotFoundError('Report');
    if (report.query.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    // Filter sections based on payment status
    const sections = report.sections.map((s) => {
      if (!s.isFree && !report.isPaid) {
        return {
          id: s.id,
          sectionType: s.sectionType,
          titleEn: s.titleEn,
          titleHi: s.titleHi,
          contentEn: null,
          contentHi: null,
          sortOrder: s.sortOrder,
          isFree: s.isFree,
          locked: true,
        };
      }
      return { ...s, locked: false };
    });

    res.json({
      report: {
        id: report.id,
        overallRiskScore: report.overallRiskScore,
        riskVerdict: report.riskVerdict,
        verdictEn: report.isPaid || report.status === 'completed' ? report.verdictEn : null,
        verdictHi: report.isPaid ? report.verdictHi : null,
        maintenanceCost1y: report.maintenanceCost1y,
        maintenanceCost3y: report.maintenanceCost3y,
        dataCompleteness: report.dataCompleteness,
        modelVersion: report.modelVersion,
        isPaid: report.isPaid,
        status: report.status,
        generatedAt: report.generatedAt,
      },
      sections,
    });
  },

  /**
   * GET /reports/:reportId/sections
   */
  async getSections(req, res) {
    const { reportId } = req.params;

    const report = await prisma.riskReport.findUnique({
      where: { id: reportId },
      include: {
        query: { select: { userId: true } },
        sections: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!report) throw new NotFoundError('Report');
    if (report.query.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const sections = report.sections.map((s) => {
      if (!s.isFree && !report.isPaid) {
        return { id: s.id, sectionType: s.sectionType, titleEn: s.titleEn, titleHi: s.titleHi, sortOrder: s.sortOrder, isFree: s.isFree, locked: true };
      }
      return { ...s, locked: false };
    });

    res.json({ sections });
  },
};

module.exports = { reportController };
