const { Sale, Coupon } = require('../models/Sale');
const { Product } = require('../models/Product');

// @desc    Process a sale (POS or Add Sale)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  const { 
    customer, customerMobile, orderItems, discountTotal, paymentMode, amountPaid,
    saleDate, referenceNo, biller, warehouse, currency, exchangeRate, 
    orderTax, discountType, discountValue, shippingCost, saleStatus, 
    paymentStatus, saleNote, staffNote 
  } = req.body;

  try {
    const itemsToProcess = orderItems || req.body.items;
    
    if (!itemsToProcess || itemsToProcess.length === 0) {
      res.status(400);
      return next(new Error('No sale items provided'));
    }

    let subTotal = 0;
    let taxTotal = 0;
    const computedItems = [];

    // Calculate details and verify stock
    for (const item of itemsToProcess) {
      // Find product by id if provided, else by code or name
      // Find product by id if provided, else by code or name
      let prodQuery = { $or: [] };
      if (item.productId || item.product) prodQuery.$or.push({ _id: item.productId || item.product });
      if (item.code) prodQuery.$or.push({ productCode: item.code });
      if (item.name) prodQuery.$or.push({ productName: item.name });

      const dbProduct = await Product.findOne(prodQuery.$or.length ? prodQuery : { _id: null });

      if (!dbProduct) {
        res.status(404);
        return next(new Error(`Product not found: ${item.code || item.name || item.productId}`));
      }

      if (dbProduct.currentStock < item.quantity) {
        res.status(400);
        return next(new Error(`Insufficient stock for product ${dbProduct.productName}. Available: ${dbProduct.currentStock}`));
      }

      const itemPrice = item.netUnitPrice || dbProduct.productPrice || dbProduct.salePrice || 0;
      const itemTaxRate = item.taxPercent || dbProduct.taxRate || 0;
      
      const itemSubtotal = itemPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const subtotalAfterDiscount = itemSubtotal - itemDiscount;
      const itemTaxAmount = (subtotalAfterDiscount * itemTaxRate) / 100;
      const itemGrand = subtotalAfterDiscount + itemTaxAmount;

      subTotal += subtotalAfterDiscount;
      taxTotal += itemTaxAmount;

      computedItems.push({
        product: dbProduct._id,
        name: item.name || dbProduct.name,
        code: item.code || dbProduct.code,
        quantity: item.quantity,
        netUnitPrice: itemPrice,
        discount: itemDiscount,
        taxPercent: itemTaxRate,
        total: itemGrand
      });

      // Deduct Stock
      dbProduct.currentStock -= item.quantity;
      await dbProduct.save();
    }

    const parsedShipping = Number(shippingCost) || 0;
    const finalGrandTotal = subTotal + taxTotal - (discountTotal || 0) + parsedShipping;
    const invoiceNo = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newSale = await Sale.create({
      invoiceNo,
      saleDate,
      referenceNo,
      biller,
      warehouse,
      customer: customer || req.body.customerName,
      customerMobile,
      currency,
      exchangeRate,
      orderItems: computedItems,
      orderTax,
      discountType,
      discountValue,
      shippingCost,
      saleStatus,
      paymentStatus,
      saleNote,
      staffNote,
      subTotal,
      discountTotal: discountTotal || 0,
      taxTotal,
      grandTotal: finalGrandTotal,
      paymentMode,
      amountPaid: amountPaid || finalGrandTotal,
      changeReturned: Math.max(0, (amountPaid || finalGrandTotal) - finalGrandTotal),
      salesPerson: req.user?._id,
      company: req.user?.company || req.body.company
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
    const sales = await Sale.find({ company: req.user?.company }).populate('salesPerson', 'username email');
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res, next) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company }, 
      req.body, 
      { new: true, runValidators: true }
    );
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
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    if (!sale) {
      res.status(404);
      return next(new Error('Sale not found'));
    }
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale
};
