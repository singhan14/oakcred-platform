const router = require('express').Router();
const borrower = require('../controllers/borrowerController');
const { authenticate, authorize } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');

router.use(authenticate, firmIsolation);

router.post('/', authorize('CA_ADMIN', 'CA_STAFF'), borrower.create);
router.get('/', borrower.list);
router.get('/:id', borrower.getById);
router.put('/:id', authorize('CA_ADMIN', 'CA_STAFF'), borrower.update);
router.delete('/:id', authorize('CA_ADMIN'), borrower.remove);
router.post('/:id/consent', authorize('CA_ADMIN', 'CA_STAFF'), borrower.sendConsent);
router.get('/:id/consent', borrower.getConsentStatus);
router.get('/:id/history', borrower.getHistory);

module.exports = router;
