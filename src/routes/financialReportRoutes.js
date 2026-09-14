const express = require('express');
const router = express.Router();
const {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
  getOutstanding
} = require('../controllers/financialReportController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/trial-balance', protect, checkPermission('manage_hrms'), getTrialBalance);
router.get('/profit-and-loss', protect, checkPermission('manage_hrms'), getProfitAndLoss);
router.get('/balance-sheet', protect, checkPermission('manage_hrms'), getBalanceSheet);
router.get('/outstanding', protect, checkPermission('manage_hrms'), getOutstanding);

module.exports = router;
