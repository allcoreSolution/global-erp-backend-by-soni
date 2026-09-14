const express = require('express');
const router = express.Router();
const {
  getAccountWiseSummary,
  getDebitCreditSummary,
  getCashFlow,
  getBankBalance,
  getOpeningClosingBalance
} = require('../controllers/analysisReportController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/account-wise', protect, checkPermission('manage_hrms'), getAccountWiseSummary);
router.get('/debit-credit', protect, checkPermission('manage_hrms'), getDebitCreditSummary);
router.get('/cash-flow', protect, checkPermission('manage_hrms'), getCashFlow);
router.get('/bank-balance', protect, checkPermission('manage_hrms'), getBankBalance);
router.get('/opening-closing', protect, checkPermission('manage_hrms'), getOpeningClosingBalance);

module.exports = router;
