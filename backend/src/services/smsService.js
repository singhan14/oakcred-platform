const config = require('../config');

/**
 * SMS service — uses Twilio in production, logs in mock mode.
 */
async function sendSMS({ to, body }) {
  if (config.twilio.sid === 'mock') {
    console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);
    return { success: true, mock: true, sid: 'mock-sid' };
  }

  const twilio = require('twilio');
  const client = twilio(config.twilio.sid, config.twilio.token);
  const message = await client.messages.create({
    body,
    from: config.twilio.phone,
    to,
  });

  return { success: true, sid: message.sid };
}

async function sendOTP(phone, otp) {
  return sendSMS({
    to: phone,
    body: `Your CreditIQ verification code is: ${otp}. Valid for 10 minutes.`,
  });
}

async function sendConsentSMS(phone, firmName, consentUrl) {
  return sendSMS({
    to: phone,
    body: `${firmName} requests access to your financial data via CreditIQ. Review: ${consentUrl}`,
  });
}

module.exports = { sendSMS, sendOTP, sendConsentSMS };
