const router = require('express').Router();
const monitoring = require('../controllers/monitoringController');
const { authenticate } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');

router.use(authenticate, firmIsolation);

router.post('/:assessmentId/start', monitoring.startMonitoring);
router.get('/dashboard', monitoring.getDashboard);
router.get('/:id', monitoring.getById);
router.put('/:id/update', monitoring.updateMonitor);
router.post('/bulk-check', monitoring.bulkCheck);

module.exports = router;
