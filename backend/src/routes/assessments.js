const router = require('express').Router();
const assessment = require('../controllers/assessmentController');
const { authenticate } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');
const { checkSubscription, checkAssessmentLimit } = require('../middleware/subscription');

router.use(authenticate, firmIsolation);

router.post('/:borrowerId/run', checkSubscription, checkAssessmentLimit, assessment.runAssessment);
router.get('/:borrowerId', assessment.getLatest);
router.get('/:borrowerId/history', assessment.getHistory);
router.get('/:id/report', assessment.getReport);
router.post('/:id/generate-report', assessment.generateReportForAssessment);

module.exports = router;
