const express = require('express');
const router = express.Router();
const {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
  getOutstanding,
  getReceivableAging,
  getPayableAging
} = require('../controllers/financialReportController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/trial-balance', protect, checkPermission('view_reports'), getTrialBalance);
router.get('/profit-and-loss', protect, checkPermission('view_reports'), getProfitAndLoss);
router.get('/balance-sheet', protect, checkPermission('view_reports'), getBalanceSheet);
router.get('/outstanding', protect, checkPermission('view_reports'), getOutstanding);
router.get('/receivable-aging', protect, checkPermission('view_reports'), getReceivableAging);
router.get('/payable-aging', protect, checkPermission('view_reports'), getPayableAging);

module.exports = router;
