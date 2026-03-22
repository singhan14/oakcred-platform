const router = require('express').Router();
const express = require('express');
const billing = require('../controllers/billingController');
const { authenticate } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');

// Public route — no auth needed
router.get('/plans', billing.getPlans);

// Razorpay webhook — needs raw body parser
router.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), billing.razorpayWebhook);

// Protected routes
router.post('/subscribe', authenticate, firmIsolation, billing.subscribe);
router.post('/verify', authenticate, firmIsolation, billing.verifyPayment);
router.get('/subscription', authenticate, firmIsolation, billing.getSubscription);
router.delete('/subscription', authenticate, firmIsolation, billing.cancelSubscription);

module.exports = router;
