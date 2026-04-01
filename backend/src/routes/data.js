const router = require('express').Router();
const multer = require('multer');
const data = require('../controllers/dataController');
const { authenticate } = require('../middleware/auth');
const firmIsolation = require('../middleware/firmIsolation');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/csv' || file.mimetype.includes('spreadsheet')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or CSV files are allowed'), false);
    }
  },
});

router.use(authenticate, firmIsolation);

router.post('/:borrowerId/sync-gst', data.syncGST);
router.post('/:borrowerId/upload-gst', upload.single('file'), data.uploadGST);
router.post('/:borrowerId/upload-itr', upload.single('file'), data.uploadITR);
router.post('/:borrowerId/upload-bank-statement', upload.single('file'), data.uploadBankStatement);
router.post('/:borrowerId/manual-entry', data.manualEntry);

module.exports = router;
