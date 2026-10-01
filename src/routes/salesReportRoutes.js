const express = require('express');
const router = express.Router();
const {
  getGeneralSalesSummary,
  getDailySalesReport,
  getMonthlySalesReport,
  getYearlySalesReport,
  getSalesInvoiceRegister,
  getSalesReturnReport,
  getNetSalesReport,
  addReportAdjustment,
  updateReportAdjustment,
  deleteReportAdjustment,
  getProductWiseSales,
  getCustomerWiseSales,
  getCategoryWiseSales,
  getBrandWiseSales,
  getSalespersonWiseSales,
  getBranchWiseSales,
  getWarehouseWiseSales,
  getDiscountReport,
  getTaxReport,
  getProfitMarginReport
} = require('../controllers/salesReportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Ensure user is authenticated

// GET report endpoints
router.get('/general-summary', getGeneralSalesSummary);
router.get('/daily', getDailySalesReport);
router.get('/monthly', getMonthlySalesReport);
router.get('/yearly', getYearlySalesReport);
router.get('/invoice-register', getSalesInvoiceRegister);
router.get('/return-report', getSalesReturnReport);
router.get('/net-sales', getNetSalesReport);

// CRUD endpoints for report adjustments
router.post('/adjustment', addReportAdjustment);
router.put('/adjustment/:id', updateReportAdjustment);
router.delete('/adjustment/:id', deleteReportAdjustment);

// Analysis endpoints
router.get('/analysis/product-wise', getProductWiseSales);
router.get('/analysis/customer-wise', getCustomerWiseSales);
router.get('/analysis/category-wise', getCategoryWiseSales);
router.get('/analysis/brand-wise', getBrandWiseSales);
router.get('/analysis/salesperson-wise', getSalespersonWiseSales);
router.get('/analysis/branch-wise', getBranchWiseSales);
router.get('/analysis/warehouse-wise', getWarehouseWiseSales);

// Financial endpoints
router.get('/financial/discount', getDiscountReport);
router.get('/financial/tax', getTaxReport);
router.get('/financial/margin', getProfitMarginReport);

module.exports = router;
