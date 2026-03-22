const prisma = require('../config/database');

const PLAN_LIMITS = {
  STARTER: 20,
  PRACTICE: 100,
  ENTERPRISE: Infinity,
  TRIAL: 5,
};

/**
 * Verify user's firm has an active subscription.
 */
const checkSubscription = async (req, res, next) => {
  try {
    const firm = await prisma.firm.findUnique({ where: { id: req.firmId } });

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    if (firm.subscriptionStatus !== 'ACTIVE' && firm.subscriptionStatus !== 'TRIAL') {
      return res.status(403).json({
        error: 'Active subscription required',
        message: 'Please subscribe to a plan to continue.',
      });
    }

    if (firm.subscriptionExpiry && new Date(firm.subscriptionExpiry) < new Date()) {
      return res.status(403).json({
        error: 'Subscription expired',
        message: 'Please renew your subscription.',
      });
    }

    req.firm = firm;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Enforce monthly assessment limits based on subscription plan.
 */
const checkAssessmentLimit = async (req, res, next) => {
  try {
    const firm = req.firm || await prisma.firm.findUnique({ where: { id: req.firmId } });
    const limit = PLAN_LIMITS[firm.subscriptionPlan] || 0;

    if (limit === Infinity) {
      return next();
    }

    // Count assessments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.creditAssessment.count({
      where: {
        firmId: req.firmId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (count >= limit) {
      return res.status(429).json({
        error: 'Assessment limit reached',
        message: `Your ${firm.subscriptionPlan} plan allows ${limit} assessments per month. Used: ${count}/${limit}.`,
        limit,
        used: count,
      });
    }

    req.assessmentsUsed = count;
    req.assessmentLimit = limit;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkSubscription, checkAssessmentLimit, PLAN_LIMITS };
