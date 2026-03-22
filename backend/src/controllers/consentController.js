const prisma = require('../config/database');
const { generateToken, generateOTP } = require('../utils/helpers');
const { sendConsentRequestEmail } = require('../services/emailService');
const { sendConsentSMS, sendOTP } = require('../services/smsService');
const config = require('../config');

// In-memory OTP store for simplicity (use Redis in production)
const otpStore = new Map();

// POST /api/consent/request
exports.createRequest = async (req, res, next) => {
  try {
    const { borrowerId, dataTypes, validityDays } = req.body;

    const borrower = await prisma.borrower.findFirst({
      where: { id: borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + (validityDays || 365) * 24 * 60 * 60 * 1000);

    const consentRequest = await prisma.consentRequest.create({
      data: {
        borrowerId,
        firmId: req.firmId,
        token,
        dataTypes: dataTypes || ['GST', 'ITR', 'BANK_STATEMENT'],
        validityDays: validityDays || 365,
        expiresAt,
      },
    });

    // Update borrower consent info
    await prisma.borrower.update({
      where: { id: borrowerId },
      data: { consentToken: token, consentExpiry: expiresAt, consentStatus: 'PENDING' },
    });

    // Send notifications
    const consentUrl = `${config.clientUrl}/consent/${token}`;
    const firm = await prisma.firm.findUnique({ where: { id: req.firmId } });

    if (borrower.email) {
      await sendConsentRequestEmail(borrower.email, borrower.name, firm.name, token);
    }
    if (borrower.phone) {
      await sendConsentSMS(borrower.phone, firm.name, consentUrl);
    }

    res.status(201).json({ message: 'Consent request sent', consentRequest });
  } catch (err) {
    next(err);
  }
};

// GET /api/consent/public/:token (no auth required)
exports.getPublicConsent = async (req, res, next) => {
  try {
    const consentRequest = await prisma.consentRequest.findUnique({
      where: { token: req.params.token },
      include: {
        firm: { select: { name: true, icaiNumber: true } },
        borrower: { select: { name: true, phone: true } },
      },
    });

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    if (consentRequest.status !== 'PENDING') {
      return res.json({
        status: consentRequest.status,
        message: consentRequest.status === 'APPROVED'
          ? 'Consent already granted'
          : 'Consent request is no longer valid',
      });
    }

    if (new Date() > new Date(consentRequest.expiresAt)) {
      await prisma.consentRequest.update({
        where: { id: consentRequest.id },
        data: { status: 'EXPIRED' },
      });
      return res.json({ status: 'EXPIRED', message: 'This consent request has expired' });
    }

    // Send OTP for verification
    const otp = generateOTP();
    const maskedPhone = consentRequest.borrower.phone
      ? consentRequest.borrower.phone.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2')
      : null;

    otpStore.set(req.params.token, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    if (consentRequest.borrower.phone) {
      await sendOTP(consentRequest.borrower.phone, otp);
    }

    res.json({
      firmName: consentRequest.firm.name,
      icaiNumber: consentRequest.firm.icaiNumber,
      borrowerName: consentRequest.borrower.name,
      dataTypes: consentRequest.dataTypes,
      validityDays: consentRequest.validityDays,
      expiresAt: consentRequest.expiresAt,
      maskedPhone,
      otpSent: true,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/consent/respond/:token (no auth required)
exports.respondToConsent = async (req, res, next) => {
  try {
    const { action, otp } = req.body; // action: 'approve' or 'reject'

    const consentRequest = await prisma.consentRequest.findUnique({
      where: { token: req.params.token },
    });

    if (!consentRequest || consentRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Invalid or expired consent request' });
    }

    // Verify OTP
    const stored = otpStore.get(req.params.token);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    otpStore.delete(req.params.token);

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const consentStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED';

    await prisma.consentRequest.update({
      where: { id: consentRequest.id },
      data: { status: newStatus, respondedAt: new Date() },
    });

    await prisma.borrower.update({
      where: { id: consentRequest.borrowerId },
      data: { consentStatus },
    });

    res.json({
      status: newStatus,
      message: action === 'approve'
        ? 'Consent granted successfully'
        : 'Consent request declined',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/consent/:borrowerId/status
exports.getConsentStatus = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const latestConsent = await prisma.consentRequest.findFirst({
      where: { borrowerId: req.params.borrowerId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      consentStatus: borrower.consentStatus,
      consentExpiry: borrower.consentExpiry,
      consentDataTypes: borrower.consentDataTypes,
      latestRequest: latestConsent,
    });
  } catch (err) {
    next(err);
  }
};
