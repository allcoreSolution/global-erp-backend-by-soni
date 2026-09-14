const { Sale, Coupon } = require('../models/Sale');
const { Product } = require('../models/Product');

// @desc    Process a sale (POS or Add Sale)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  const { customerName, customerMobile, items, discountTotal, paymentMode, amountPaid } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No sale items provided'));
    }

    let subTotal = 0;
    let taxTotal = 0;
    const computedItems = [];

    // Calculate details and verify stock
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        res.status(404);
        return next(new Error(`Product not found: ${item.productId}`));
      }

      if (dbProduct.currentStock < item.quantity) {
        res.status(400);
        return next(new Error(`Insufficient stock for product ${dbProduct.name}. Available: ${dbProduct.currentStock}`));
      }

      const itemPrice = dbProduct.salePrice;
      const itemTaxRate = dbProduct.taxRate || 0;
      
      const itemSubtotal = itemPrice * item.quantity;
      const itemTaxAmount = (itemSubtotal * itemTaxRate) / 100;
      const itemGrand = itemSubtotal + itemTaxAmount;

      subTotal += itemSubtotal;
      taxTotal += itemTaxAmount;

      computedItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: itemPrice,
        taxAmount: itemTaxAmount,
        total: itemGrand
      });

      // Deduct Stock
      dbProduct.currentStock -= item.quantity;
      await dbProduct.save();
    }

    const finalGrandTotal = subTotal + taxTotal - (discountTotal || 0);
    const invoiceNo = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newSale = await Sale.create({
      invoiceNo,
      customerName,
      customerMobile,
      items: computedItems,
      subTotal,
      discountTotal: discountTotal || 0,
      taxTotal,
      grandTotal: finalGrandTotal,
      paymentMode,
      amountPaid: amountPaid || finalGrandTotal,
      changeReturned: Math.max(0, (amountPaid || finalGrandTotal) - finalGrandTotal),
      salesPerson: req.user._id
    });

    res.status(201).json({ success: true, data: newSale });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find({ company: req.user?.companyId, company: req.user?.companyId }).populate('items.product').populate('salesPerson', 'username email');
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate and fetch Coupon
// @route   GET /api/sales/coupons/validate/:code
// @access  Private
const validateCoupon = async (req, res, next) => {
  const { code } = req.params;
  try {
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      res.status(404);
      return next(new Error('Coupon not found or inactive'));
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      return next(new Error('Coupon has expired'));
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!sale) {
      res.status(404);
      return next(new Error('Sale not found'));
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      res.status(404);
      return next(new Error('Sale not found'));
    }
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- COUPON CRUD OPERATIONS ---

// @desc    Create a new coupon
// @route   POST /api/sales/coupon
// @access  Private
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/sales/coupon
// @access  Private
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ company: req.user?.companyId });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coupon by ID
// @route   GET /api/sales/coupon/:id
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

// @desc    Update coupon
// @route   PUT /api/sales/coupon/:id
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

// @desc    Delete coupon
// @route   DELETE /api/sales/coupon/:id
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

module.exports = {
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
};
