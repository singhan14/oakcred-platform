const prisma = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates and sends a 6-digit OTP to the user's email.
 * If user doesn't exist, it creates a temporary user record.
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 2. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if not exists (for registration-on-first-login)
      // We use a dummy firmId initially or create a firm if needed.
      // For now, let's just create the user.
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          password: 'CUSTOM_OTP_USER',
          role: 'CA_ADMIN', // Default to CA_ADMIN for new signups
          otpCode: otp,
          otpExpires,
          firmId: '00000000-0000-0000-0000-000000000000' // Placeholder (will be updated on verify)
        }
      });
    } else {
      // Update existing user with new OTP
      await prisma.user.update({
        where: { email },
        data: { otpCode: otp, otpExpires }
      });
    }

    // 3. Send Email via Google SMTP
    await emailService.sendOTP(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('[OTP SEND] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
};

/**
 * Verifies the OTP and issues a JWT.
 * Handles automated onboarding for brand-new users.
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true }
    });

    if (!user || user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // 1. Clear OTP from DB
    let updatedUser = await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpires: null, lastLogin: new Date() },
      include: { firm: true }
    });

    // 2. Handle Automated Onboarding (Workspace creation)
    if (updatedUser.firmId === '00000000-0000-0000-0000-000000000000' || !updatedUser.firm) {
      console.log(`[ONBOARDING] New user verified: ${email}. Provisioning workspace...`);
      
      const firmName = `${updatedUser.name}'s Workspace`;

      const firm = await prisma.firm.create({
        data: { name: firmName, type: 'LENDER' }
      });

      updatedUser = await prisma.user.update({
        where: { email },
        data: { firmId: firm.id },
        include: { firm: true }
      });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: updatedUser.id, firmId: updatedUser.firmId, role: updatedUser.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        firm: updatedUser.firm
      }
    });
  } catch (err) {
    console.error('[OTP VERIFY] Error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

/**
 * Standard password-based login for administrative access.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password using bcrypt for hashed passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, firmId: user.firmId, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firm: user.firm
      }
    });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { firm: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { sendOTP, verifyOTP, login, me };
