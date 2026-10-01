const express = require('express');
const router = express.Router();
const {
  getGeneralPurchaseSummary,
  getDailyPurchaseReport,
  getMonthlyPurchaseReport,
  getYearlyPurchaseReport,
  getPurchaseInvoiceRegister,
  getPurchaseReturnReport,
  getNetPurchaseReport,
  getProductWisePurchase,
  getSupplierWisePurchase,
  getCategoryWisePurchase,
  getBrandWisePurchase,
  getBranchWisePurchase,
  getWarehouseWisePurchase,
  getPurchaseAmountReport,
  getPurchaseDiscountReport,
  getTaxGstPaidReport,
  getPurchaseCostReport,
  getSupplierOutstandingReport,
  getPaidVsPendingPurchaseReport,
  getTopSuppliersReport,
  getFrequentlyPurchasedReport,
  getPriceComparisonReport
} = require('../controllers/purchaseReportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Ensure user is authenticated

// GET report endpoints
router.get('/performance/top-suppliers', getTopSuppliersReport);
router.get('/performance/frequently-purchased', getFrequentlyPurchasedReport);
router.get('/performance/price-comparison', getPriceComparisonReport);
router.get('/general-summary', getGeneralPurchaseSummary);
router.get('/daily', getDailyPurchaseReport);
router.get('/monthly', getMonthlyPurchaseReport);
router.get('/yearly', getYearlyPurchaseReport);
router.get('/invoice-register', getPurchaseInvoiceRegister);
router.get('/return-report', getPurchaseReturnReport);
router.get('/net-purchase', getNetPurchaseReport);


// Analysis endpoints
router.get('/analysis/product-wise', getProductWisePurchase);
router.get('/analysis/supplier-wise', getSupplierWisePurchase);
router.get('/analysis/category-wise', getCategoryWisePurchase);
router.get('/analysis/brand-wise', getBrandWisePurchase);
router.get('/analysis/branch-wise', getBranchWisePurchase);
router.get('/analysis/warehouse-wise', getWarehouseWisePurchase);

// Financial endpoints
router.get('/financial/purchase-amount', getPurchaseAmountReport);
router.get('/financial/discount-report', getPurchaseDiscountReport);
router.get('/financial/tax-gst-paid', getTaxGstPaidReport);
router.get('/financial/purchase-cost', getPurchaseCostReport);
router.get('/financial/supplier-outstanding', getSupplierOutstandingReport);
router.get('/financial/paid-vs-pending', getPaidVsPendingPurchaseReport);

module.exports = router;
