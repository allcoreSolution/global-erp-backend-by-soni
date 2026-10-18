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

router.get('/account-wise', protect, checkPermission('view_reports'), getAccountWiseSummary);
router.get('/debit-credit', protect, checkPermission('view_reports'), getDebitCreditSummary);
router.get('/cash-flow', protect, checkPermission('view_reports'), getCashFlow);
router.get('/bank-balance', protect, checkPermission('view_reports'), getBankBalance);
router.get('/opening-closing', protect, checkPermission('view_reports'), getOpeningClosingBalance);

module.exports = router;
