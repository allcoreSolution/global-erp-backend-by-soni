const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getTdsPurchaseReport,
  getTdsSalesReport,
  getTdsReconciliation,
  getTdsTaxAnalysis
} = require('../controllers/tdsReportController');

router.use(protect);

router.get('/purchase', getTdsPurchaseReport);
router.get('/sales', getTdsSalesReport);
router.get('/reconciliation', getTdsReconciliation);
router.get('/tax-analysis', getTdsTaxAnalysis);

module.exports = router;
