const express = require('express');
const router = express.Router();
const { 
  getStockSummary, 
  getLowStockReport,
  getCurrentStock,
  getOpeningStock,
  getClosingStock,
  getStockLedger,
  getStockMovement,
  getStockValuation,
  getWarehouseWiseStock,
  getBranchWiseStock,
  getProductWiseStock,
  getOverstockReport,
  getOutOfStockReport,
  getDamagedStockReport,
  getExpiredStockReport,
  getStockAdjustmentReport,
  getStockTransferReport
} = require('../controllers/stockReportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/summary', getStockSummary);
router.get('/low-stock', getLowStockReport);
router.get('/current-stock', getCurrentStock);
router.get('/opening-stock', getOpeningStock);
router.get('/closing-stock', getClosingStock);
router.get('/ledger', getStockLedger);
router.get('/movement', getStockMovement);
router.get('/valuation', getStockValuation);
router.get('/warehouse-wise', getWarehouseWiseStock);
router.get('/branch-wise', getBranchWiseStock);
router.get('/product-wise', getProductWiseStock);

// Stock Control Reports
router.get('/overstock', getOverstockReport);
router.get('/out-of-stock', getOutOfStockReport);
router.get('/damaged', getDamagedStockReport);
router.get('/expired', getExpiredStockReport);
router.get('/adjustment', getStockAdjustmentReport);
router.get('/transfer', getStockTransferReport);

module.exports = router;
