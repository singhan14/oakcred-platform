const prisma = require('../config/database');
const { generateToken, paginationMeta } = require('../utils/helpers');
const { sendConsentRequestEmail } = require('../services/emailService');
const { sendConsentSMS } = require('../services/smsService');
const config = require('../config');

// POST /api/borrowers
exports.create = async (req, res, next) => {
  try {
    const { name, type, gstin, pan, udyamNumber, dateOfBirth, businessName, industry, city, state, phone, email } = req.body;

    const borrower = await prisma.borrower.create({
      data: {
        firmId: req.firmId,
        name, type: type || 'INDIVIDUAL',
        gstin, pan, udyamNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        businessName, industry, city, state, phone, email,
        createdById: req.user.userId,
      },
    });

    res.status(201).json(borrower);
  } catch (err) {
    next(err);
  }
};

// GET /api/borrowers
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, consentStatus } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = { firmId: req.firmId, isDeleted: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { pan: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (consentStatus) where.consentStatus = consentStatus;

    const [borrowers, total] = await Promise.all([
      prisma.borrower.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { assessments: true } },
          assessments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true, overallScore: true, verdict: true,
              confidenceLevel: true, createdAt: true,
            },
          },
        },
      }),
      prisma.borrower.count({ where }),
    ]);

    res.json({
      data: borrowers,
      pagination: paginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/borrowers/:id
exports.getById = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.id, firmId: req.firmId, isDeleted: false },
      include: {
        gstData: { orderBy: { period: 'desc' }, take: 24 },
        itrData: { orderBy: { assessmentYear: 'desc' } },
        bankStatements: { orderBy: { fetchedAt: 'desc' }, take: 1 },
        assessments: { orderBy: { createdAt: 'desc' }, take: 5 },
        consentRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    res.json(borrower);
  } catch (err) {
    next(err);
  }
};

// PUT /api/borrowers/:id
exports.update = async (req, res, next) => {
  try {
    const { name, type, gstin, pan, udyamNumber, dateOfBirth, businessName, industry, city, state, phone, email } = req.body;

    const borrower = await prisma.borrower.updateMany({
      where: { id: req.params.id, firmId: req.firmId, isDeleted: false },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(gstin !== undefined && { gstin }),
        ...(pan && { pan }),
        ...(udyamNumber !== undefined && { udyamNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(businessName !== undefined && { businessName }),
        ...(industry && { industry }),
        ...(city && { city }),
        ...(state && { state }),
        ...(phone && { phone }),
        ...(email && { email }),
      },
    });

    if (borrower.count === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const updated = await prisma.borrower.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/borrowers/:id (soft delete)
exports.remove = async (req, res, next) => {
  try {
    const result = await prisma.borrower.updateMany({
      where: { id: req.params.id, firmId: req.firmId, isDeleted: false },
      data: { isDeleted: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    res.json({ message: 'Borrower deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/borrowers/:id/consent — send consent request
exports.sendConsent = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.id, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    const dataTypes = req.body.dataTypes || ['GST', 'ITR', 'BANK_STATEMENT'];

    const consentRequest = await prisma.consentRequest.create({
      data: {
        borrowerId: borrower.id,
        firmId: req.firmId,
        token,
        dataTypes,
        expiresAt,
      },
    });

    await prisma.borrower.update({
      where: { id: borrower.id },
      data: { consentToken: token, consentExpiry: expiresAt, consentDataTypes: dataTypes },
    });

    // Send SMS and email
    const consentUrl = `${config.clientUrl}/consent/${token}`;
    if (borrower.email) {
      await sendConsentRequestEmail(borrower.email, borrower.name, req.user.firm.name, token);
    }
    if (borrower.phone) {
      await sendConsentSMS(borrower.phone, req.user.firm.name, consentUrl);
    }

    res.json({ message: 'Consent request sent', consentRequest });
  } catch (err) {
    next(err);
  }
};

// GET /api/borrowers/:id/consent
exports.getConsentStatus = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.id, firmId: req.firmId, isDeleted: false },
      select: { consentStatus: true, consentExpiry: true, consentDataTypes: true },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    res.json(borrower);
  } catch (err) {
    next(err);
  }
};

// GET /api/borrowers/:id/history
exports.getHistory = async (req, res, next) => {
  try {
    const assessments = await prisma.creditAssessment.findMany({
      where: { borrowerId: req.params.id, firmId: req.firmId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, overallScore: true, verdict: true, confidenceLevel: true,
        modelLayer: true, createdAt: true, reportUrl: true,
      },
    });

    res.json({
      borrowerId: req.params.id,
      assessments,
      scoreTrend: assessments.map(a => ({ date: a.createdAt, score: a.overallScore })).reverse(),
    });
  } catch (err) {
    next(err);
  }
};
