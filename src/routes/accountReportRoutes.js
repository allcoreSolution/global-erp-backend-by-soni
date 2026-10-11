const express = require('express');
const router = express.Router();
const { getUnifiedAccountingOverview } = require('../controllers/accountReportController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

// Unified endpoint for accounts and financial reports
router.get('/unified-overview', getUnifiedAccountingOverview);

module.exports = router;
