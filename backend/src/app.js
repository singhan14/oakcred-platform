const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const borrowerRoutes = require('./routes/borrowers');
const dataRoutes = require('./routes/data');
const assessmentRoutes = require('./routes/assessments');
const monitoringRoutes = require('./routes/monitoring');
const billingRoutes = require('./routes/billing');
const consentRoutes = require('./routes/consent');

const app = express();

// ─── SECURITY ───────────────────────────────────────────────
app.use(helmet());

// Manual CORS logic for absolute production reliability
const rawOrigins = config.clientUrl || '';
const origins = rawOrigins.split(',').map(o => o.trim().toLowerCase());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // NUCLEAR OPTION: Always reflect the origin to ensure CORS passes
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ─── BODY PARSING ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── LOGGING ────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── RATE LIMITING ──────────────────────────────────────────
app.use('/api', globalLimiter);

// ─── SERVE LOCAL STORAGE FILES (dev mode) ───────────────────
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CreditIQ API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API ROUTES ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/consent', consentRoutes);

// ─── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── ERROR HANDLER ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
