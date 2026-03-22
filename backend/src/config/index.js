require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

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

  azure: {
    storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerReports: process.env.AZURE_STORAGE_CONTAINER_REPORTS || 'reports',
    containerUploads: process.env.AZURE_STORAGE_CONTAINER_UPLOADS || 'uploads',
    keyVaultUrl: process.env.AZURE_KEY_VAULT_URL || '',
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
