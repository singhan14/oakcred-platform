require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'mock',
  },

  twilio: {
    sid: process.env.TWILIO_SID || 'mock',
    token: process.env.TWILIO_TOKEN || 'mock',
    phone: process.env.TWILIO_PHONE || '+15005550006',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret',
  },

  gstn: {
    apiKey: process.env.GSTN_API_KEY || 'mock',
  },

  aws: {
    region: process.env.AWS_REGION || 'eu-north-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || 'creditiq-32char-enc-key-dev2026!',
  },

  isMock(service) {
    const val = this[service]?.apiKey || this[service]?.sid;
    return val === 'mock';
  },
};

module.exports = config;
