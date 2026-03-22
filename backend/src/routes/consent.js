const router = require('express').Router();
const consent = require('../controllers/consentController');
const { authenticate } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');

// Public routes (no auth) — borrower-facing consent page
router.get('/public/:token', consent.getPublicConsent);
router.post('/respond/:token', consent.respondToConsent);

// Protected routes
router.post('/request', authenticate, firmIsolation, consent.createRequest);
router.get('/:borrowerId/status', authenticate, firmIsolation, consent.getConsentStatus);

module.exports = router;
