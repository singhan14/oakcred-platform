const router = require('express').Router();
const auth = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register', authLimiter, auth.register);
router.post('/verify-email', auth.verifyEmail);
router.post('/login', authLimiter, auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);
router.get('/me', authenticate, auth.me);

module.exports = router;
