const express = require('express');
const router = express.Router();
const { 
  createSale, 
  getSales, 
  updateSale, 
  deleteSale, 
  validateCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
} = require('../controllers/saleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Sales Routes
router.get('/', protect, getSales);
router.post('/', protect, checkPermission('create_sales'), createSale);
router.put('/:id', protect, checkPermission('create_sales'), updateSale);
router.delete('/:id', protect, checkPermission('create_sales'), deleteSale);

// Coupon Routes
router.get('/coupon/validate/:code', protect, validateCoupon);
router.get('/coupon', protect, getCoupons);
router.post('/coupon', protect, checkPermission('create_sales'), createCoupon);
router.get('/coupon/:id', protect, getCouponById);
router.put('/coupon/:id', protect, checkPermission('create_sales'), updateCoupon);
router.delete('/coupon/:id', protect, checkPermission('create_sales'), deleteCoupon);

module.exports = router;
