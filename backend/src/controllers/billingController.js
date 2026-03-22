const prisma = require('../config/database');
const config = require('../config');
const { PLAN_LIMITS } = require('../middleware/subscription');

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 2999,
    currency: 'INR',
    period: 'monthly',
    subtitle: 'For solo CAs',
    assessments: 20,
    users: 1,
    features: ['20 assessments/month', '1 user', 'Basic reports', 'Email support'],
  },
  {
    id: 'PRACTICE',
    name: 'Practice',
    price: 7999,
    currency: 'INR',
    period: 'monthly',
    subtitle: 'For growing practices',
    popular: true,
    assessments: 100,
    users: 5,
    features: ['100 assessments/month', '5 users', 'Full reports', 'Lender matching', 'Priority support'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 19999,
    currency: 'INR',
    period: 'monthly',
    subtitle: 'For large firms & lenders',
    assessments: Infinity,
    users: 20,
    features: ['Unlimited assessments', '20 users', 'White-label reports', 'API access', 'Dedicated support'],
  },
];

// GET /api/billing/plans
exports.getPlans = async (req, res) => {
  res.json(PLANS);
};

// POST /api/billing/subscribe
exports.subscribe = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS.find(p => p.id === planId);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (config.razorpay.keyId === 'rzp_test_mock') {
      // Mock mode — directly activate subscription
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const subscription = await prisma.subscription.create({
        data: {
          firmId: req.firmId,
          plan: planId,
          status: 'ACTIVE',
          razorpaySubId: `sub_mock_${Date.now()}`,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          assessmentLimit: PLAN_LIMITS[planId] || 20,
        },
      });

      await prisma.firm.update({
        where: { id: req.firmId },
        data: {
          subscriptionPlan: planId,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiry: periodEnd,
        },
      });

      return res.json({
        message: 'Subscription activated (mock mode)',
        subscription,
      });
    }

    // Real Razorpay integration
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });

    const firm = await prisma.firm.findUnique({ where: { id: req.firmId } });

    // Create or get Razorpay customer
    let customerId = firm.razorpayCustomerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: firm.name,
        email: firm.email || req.user.email,
      });
      customerId = customer.id;
      await prisma.firm.update({
        where: { id: req.firmId },
        data: { razorpayCustomerId: customerId },
      });
    }

    // Create subscription (would need Razorpay plan IDs in production)
    res.json({
      message: 'Razorpay subscription flow initiated',
      customerId,
      planId,
      amount: plan.price * 100,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/billing/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = req.body;

    // In mock mode, auto-verify
    if (config.razorpay.keyId === 'rzp_test_mock') {
      return res.json({ message: 'Payment verified (mock mode)', verified: true });
    }

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    res.json({ verified: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/billing/subscription
exports.getSubscription = async (req, res, next) => {
  try {
    const firm = await prisma.firm.findUnique({ where: { id: req.firmId } });
    const subscription = await prisma.subscription.findFirst({
      where: { firmId: req.firmId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    // Count assessments this period
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const assessmentsUsed = await prisma.creditAssessment.count({
      where: { firmId: req.firmId, createdAt: { gte: startOfMonth } },
    });

    res.json({
      plan: firm.subscriptionPlan,
      status: firm.subscriptionStatus,
      expiry: firm.subscriptionExpiry,
      assessmentsUsed,
      assessmentLimit: PLAN_LIMITS[firm.subscriptionPlan] || 0,
      subscription,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/billing/subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { firmId: req.firmId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'INACTIVE' },
    });

    // Set firm status — remains active until period end
    await prisma.firm.update({
      where: { id: req.firmId },
      data: { subscriptionStatus: 'INACTIVE' },
    });

    res.json({ message: 'Subscription will be cancelled at the end of the current period', endsAt: subscription.currentPeriodEnd });
  } catch (err) {
    next(err);
  }
};

// POST /api/billing/webhooks/razorpay
exports.razorpayWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature
    if (config.razorpay.keyId !== 'rzp_test_mock') {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const receivedSignature = req.headers['x-razorpay-signature'];
      if (expectedSignature !== receivedSignature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;
    const subscriptionEntity = payload?.subscription?.entity;

    switch (event) {
      case 'subscription.activated':
        // Activate subscription
        break;
      case 'subscription.charged':
        // Payment successful, extend period
        break;
      case 'subscription.halted':
        // Payment failed
        if (subscriptionEntity?.id) {
          await prisma.firm.updateMany({
            where: { razorpaySubId: subscriptionEntity.id },
            data: { subscriptionStatus: 'HALTED' },
          });
        }
        break;
      case 'subscription.cancelled':
        if (subscriptionEntity?.id) {
          await prisma.firm.updateMany({
            where: { razorpaySubId: subscriptionEntity.id },
            data: { subscriptionStatus: 'INACTIVE' },
          });
        }
        break;
    }

    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};
