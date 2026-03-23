const router = require('express').Router();
const auth = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

// New Custom OTP Flow
router.post('/otp/send', authLimiter, auth.sendOTP);
router.post('/otp/verify', authLimiter, auth.verifyOTP);

// Profile
router.get('/me', authenticate, auth.me);

module.exports = router;
