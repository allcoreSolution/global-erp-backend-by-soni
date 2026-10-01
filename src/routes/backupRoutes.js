const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/backups/temp/' });

const {
  getBackups,
  createBackup,
  restoreBackup,
  uploadBackup
} = require('../controllers/backupController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect); // Ensure user is authenticated

// Routes
router.get('/', getBackups);
router.post('/create', createBackup);
router.post('/restore/:version', restoreBackup);
router.post('/upload', upload.single('file'), uploadBackup);

module.exports = router;
