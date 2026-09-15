const { Coupon } = require('../models/Coupon');

// @desc    Create a new Coupon
// @route   POST /api/coupons
// @access  Private
const createCoupon = async (req, res, next) => {
  try {
    let { available, qty } = req.body;
    // Set available to qty if not provided or empty string
    if (available === undefined || available === '') {
        available = qty || 0;
    }
    
    const newCoupon = await Coupon.create({
      ...req.body,
      available,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newCoupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Coupons
// @route   GET /api/coupons
// @access  Private
const getCoupons = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const coupons = await Coupon.find(query);
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Coupon by ID
// @route   GET /api/coupons/:id
// @access  Private
const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      return next(new Error('Coupon not found'));
    }
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Coupon
// @route   PUT /api/coupons/:id
// @access  Private
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) {
      res.status(404);
      return next(new Error('Coupon not found'));
    }
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Coupon
// @route   DELETE /api/coupons/:id
// @access  Private
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      return next(new Error('Coupon not found'));
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate Coupon
// @route   GET /api/coupons/validate/:code
// @access  Private
const validateCoupon = async (req, res, next) => {
    try {
      const { code } = req.params;
      const coupon = await Coupon.findOne({ couponCode: code });
      if (!coupon) {
        res.status(404);
        return next(new Error('Coupon not found'));
      }
      
      if (coupon.available <= 0) {
        return next(new Error('Coupon limit reached'));
      }
  
      if (coupon.expiredDate && new Date(coupon.expiredDate) < new Date()) {
        res.status(400);
        return next(new Error('Coupon has expired'));
      }
  
      res.json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
