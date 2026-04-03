/**
 * @fileoverview Vehicle controller — search, query status, query list.
 */

const { prisma } = require('@carverify/db');
const { NotFoundError, ForbiddenError, PaymentRequiredError, QUERY_STATUS, PROVIDER_TYPE } = require('@carverify/shared');
const { auditFromReq } = require('@carverify/security/src/audit');
const { createLogger } = require('@carverify/observability');

const log = createLogger('vehicle-controller');

const vehicleController = {
  /**
   * POST /vehicles/search
   */
  async search(req, res) {
    const { queryInput, queryType, idempotencyKey } = req.validated;
    const userId = req.user.id;

    // Check quota
    const quota = await prisma.usageQuota.findFirst({
      where: {
        userId,
        quotaType: 'free_searches',
        periodEnd: { gte: new Date() },
      },
      orderBy: { periodStart: 'desc' },
    });

    // Check subscription
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    const isPaid = sub && (sub.plan === 'monthly' || sub.plan === 'annual');

    if (!isPaid) {
      if (!quota || quota.usedValue >= quota.limitValue) {
        throw new PaymentRequiredError('Free search quota exceeded. Please upgrade.', '/pricing');
      }
    }

    // Find or create vehicle
    let vehicle = null;
    if (queryType === 'vin') {
      vehicle = await prisma.vehicle.findUnique({ where: { vin: queryInput } });
    } else if (queryType === 'registration') {
      vehicle = await prisma.vehicle.findUnique({ where: { registrationNo: queryInput } });
    }

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          ...(queryType === 'vin' ? { vin: queryInput } : {}),
          ...(queryType === 'registration' ? { registrationNo: queryInput } : {}),
          ...(queryType === 'chassis' ? { chassisNumber: queryInput } : {}),
        },
      });
    }

    // Create query
    const providers = Object.values(PROVIDER_TYPE);
    const query = await prisma.vehicleQuery.create({
      data: {
        userId,
        vehicleId: vehicle.id,
        queryInput,
        queryType,
        idempotencyKey,
        status: QUERY_STATUS.PENDING,
        providersTotal: providers.length,
      },
    });

    // Increment quota
    if (!isPaid && quota) {
      await prisma.usageQuota.update({
        where: { id: quota.id },
        data: { usedValue: { increment: 1 } },
      });
    }

    // Enqueue provider fetch jobs
    const { queues } = req.app.get('deps') || {};
    if (queues?.vehicleFetch) {
      for (const providerType of providers) {
        await queues.vehicleFetch.add(`fetch-${providerType}`, {
          queryId: query.id,
          vehicleId: vehicle.id,
          queryInput,
          queryType,
          providerType,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        });
      }
    }

    // Update status
    await prisma.vehicleQuery.update({
      where: { id: query.id },
      data: { status: QUERY_STATUS.PROCESSING },
    });

    await auditFromReq(req, 'vehicle.search', { resource: 'vehicle_query', resourceId: query.id });
    log.info({ queryId: query.id, queryInput, queryType }, 'Vehicle search initiated');

    res.status(201).json({ queryId: query.id, status: QUERY_STATUS.PROCESSING });
  },

  /**
   * GET /vehicles/queries/:queryId
   */
  async getQuery(req, res) {
    const { queryId } = req.params;

    const query = await prisma.vehicleQuery.findUnique({
      where: { id: queryId },
      include: {
        vehicle: true,
        riskReport: { select: { id: true, status: true, overallRiskScore: true, riskVerdict: true, isPaid: true } },
      },
    });

    if (!query) throw new NotFoundError('Query');
    if (query.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      query: {
        id: query.id,
        status: query.status,
        queryInput: query.queryInput,
        queryType: query.queryType,
        providersFetched: query.providersFetched,
        providersTotal: query.providersTotal,
        failureReason: query.failureReason,
        createdAt: query.createdAt,
        vehicle: query.vehicle,
      },
      report: query.riskReport || null,
    });
  },

  /**
   * GET /vehicles/queries
   */
  async listQueries(req, res) {
    const { cursor, pageSize } = req.validatedQuery || { pageSize: 20 };

    const where = { userId: req.user.id };
    const queries = await prisma.vehicleQuery.findMany({
      where,
      include: {
        vehicle: { select: { make: true, model: true, year: true } },
        riskReport: { select: { id: true, overallRiskScore: true, riskVerdict: true, isPaid: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = queries.length > pageSize;
    const data = hasMore ? queries.slice(0, pageSize) : queries;

    res.json({
      data: data.map((q) => ({
        id: q.id,
        queryInput: q.queryInput,
        queryType: q.queryType,
        status: q.status,
        createdAt: q.createdAt,
        vehicle: q.vehicle,
        report: q.riskReport || null,
      })),
      cursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    });
  },
};

module.exports = { vehicleController };
