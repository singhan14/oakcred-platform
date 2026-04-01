const router = require('express').Router();
const auth = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

// New Custom OTP Flow
router.post('/otp/send', authLimiter, auth.sendOTP);
router.post('/signup', authLimiter, auth.signup);
router.post('/otp/verify', authLimiter, auth.verifyOTP);

// Standard Password Login
router.post('/login', authLimiter, auth.login);

// Password Recovery
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);

// Profile
router.get('/me', authenticate, auth.me);

module.exports = router;
