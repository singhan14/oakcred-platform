const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const { generateToken } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, firmName, firmType, gstin, pan, icaiNumber, city, state } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateToken();

    const result = await prisma.$transaction(async (tx) => {
      const firm = await tx.firm.create({
        data: {
          name: firmName,
          type: firmType || 'CA_FIRM',
          gstin, pan, icaiNumber, city, state,
          subscriptionPlan: 'TRIAL',
          subscriptionStatus: 'TRIAL',
          subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        },
      });

      const user = await tx.user.create({
        data: {
          email, password: hashedPassword, name,
          role: 'CA_ADMIN',
          firmId: firm.id,
          verificationToken,
        },
      });

      return { firm, user };
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      firm: { id: result.firm.id, name: result.firm.name },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, firmId: user.firmId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    res.json({
      accessToken,
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, firmId: user.firmId,
        firm: { id: user.firm.id, name: user.firm.name, plan: user.firm.subscriptionPlan },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, firmId: user.firmId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = generateToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { firm: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id, email: user.email, name: user.name,
      role: user.role, isVerified: user.isVerified,
      firm: {
        id: user.firm.id, name: user.firm.name,
        plan: user.firm.subscriptionPlan, status: user.firm.subscriptionStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
