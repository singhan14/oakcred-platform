const config = require('../config');

/**
 * Email service — uses SendGrid in production, logs in mock mode.
 */
async function sendEmail({ to, subject, html }) {
  if (config.sendgrid.apiKey === 'mock') {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: config.sendgrid.apiKey,
    },
  });

  await transporter.sendMail({
    from: 'noreply@creditiq.in',
    to,
    subject,
    html,
  });

  return { success: true };
}

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'CreditIQ — Verify Your Email',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>
           <p>Or copy this link: ${verifyUrl}</p>`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'CreditIQ — Reset Password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
           <p>This link expires in 1 hour.</p>`,
  });
}

async function sendConsentRequestEmail(email, borrowerName, firmName, token) {
  const consentUrl = `${config.clientUrl}/consent/${token}`;
  return sendEmail({
    to: email,
    subject: `${firmName} — Consent Request for Financial Data`,
    html: `<p>Dear ${borrowerName},</p>
           <p>${firmName} is requesting access to your financial data for a credit assessment.</p>
           <p>Click <a href="${consentUrl}">here</a> to review and approve.</p>`,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendConsentRequestEmail,
};
