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

router.get('/trial-balance', protect, checkPermission('manage_hrms'), getTrialBalance);
router.get('/profit-and-loss', protect, checkPermission('manage_hrms'), getProfitAndLoss);
router.get('/balance-sheet', protect, checkPermission('manage_hrms'), getBalanceSheet);
router.get('/outstanding', protect, checkPermission('manage_hrms'), getOutstanding);
router.get('/receivable-aging', protect, checkPermission('manage_hrms'), getReceivableAging);
router.get('/payable-aging', protect, checkPermission('manage_hrms'), getPayableAging);

module.exports = router;
