const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getGstPurchaseReport,
  getGstSalesReport,
  getGstReconciliation,
  getTaxAnalysis
} = require('../controllers/gstReportController');

router.use(protect);

router.get('/purchase', getGstPurchaseReport);
router.get('/sales', getGstSalesReport);
router.get('/reconciliation', getGstReconciliation);
router.get('/tax-analysis', getTaxAnalysis);

module.exports = router;
