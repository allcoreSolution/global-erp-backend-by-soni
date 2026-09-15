const express = require('express');
const router = express.Router();
const { 
  createCoupon, 
  getCoupons, 
  getCouponById, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/validate/:code', protect, validateCoupon);

router.route('/')
  .post(protect, createCoupon)
  .get(protect, getCoupons);

router.route('/:id')
  .get(protect, getCouponById)
  .put(protect, updateCoupon)
  .delete(protect, deleteCoupon);

module.exports = router;
