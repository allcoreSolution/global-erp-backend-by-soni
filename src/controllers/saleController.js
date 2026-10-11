const { Sale, Coupon } = require('../models/Sale');
const { Product } = require('../models/Product');
const CustomerReq = require('../models/Customer');
const Customer = CustomerReq.Customer || CustomerReq;
const User = require('../models/User');

// @desc    Process a sale (POS or Add Sale)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  const { 
    customer, customerMobile, orderItems, discountTotal, paymentMode, amountPaid,
    saleDate, referenceNo, biller, warehouse, currency, exchangeRate, 
    orderTax, discountType, discountValue, shippingCost, saleStatus, 
    paymentStatus, saleNote, staffNote, documentUrl
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

      // Check warehouse specific stock
      const targetWarehouseName = req.body.warehouse;
      const whStock = dbProduct.warehouseStocks?.find(w => w.warehouse === targetWarehouseName) || { stock: 0 };

      if (whStock.stock < item.quantity) {
        res.status(400);
        return next(new Error(`Insufficient stock for product ${dbProduct.productName} in the selected warehouse. Available: ${whStock.stock}`));
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
        name: item.name || dbProduct.productName,
        code: item.code || dbProduct.productCode,
        quantity: item.quantity,
        netUnitPrice: itemPrice,
        discount: itemDiscount,
        taxPercent: itemTaxRate,
        total: itemGrand
      });

      // Deduct Stock
      dbProduct.currentStock -= item.quantity;
      if (dbProduct.warehouseStocks && dbProduct.warehouseStocks.length > 0) {
        const whIndex = dbProduct.warehouseStocks.findIndex(w => w.warehouse === targetWarehouseName);
        if (whIndex >= 0) {
          dbProduct.warehouseStocks[whIndex].stock -= item.quantity;
        } else {
          dbProduct.warehouseStocks.push({ warehouse: targetWarehouseName, stock: -item.quantity });
        }
      } else {
        dbProduct.warehouseStocks = [{ warehouse: targetWarehouseName, stock: -item.quantity }];
      }
      
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
      documentUrl,
      subTotal,
      discountTotal: discountTotal || 0,
      taxTotal,
      grandTotal: finalGrandTotal,
      paymentMode,
      amountPaid: amountPaid !== undefined ? amountPaid : (paymentStatus === 'Pending' ? 0 : finalGrandTotal),
      changeReturned: Math.max(0, (amountPaid !== undefined ? amountPaid : (paymentStatus === 'Pending' ? 0 : finalGrandTotal)) - finalGrandTotal),
      salesPerson: req.user?._id,
      company: req.user?.company || req.body.company
    });

    // --- AUTO-VOUCHER LOGIC FOR DAY BOOK ---
    try {
      const Voucher = require('../models/Voucher');
      const AccountLedger = require('../models/AccountLedger');
      
      const companyId = req.user?.company || req.body.company || null;

      // 1. Find or create 'Sales Account'
      let salesAcc = await AccountLedger.findOne({ accountName: 'Sales Account', company: companyId });
      if (!salesAcc) {
        salesAcc = await AccountLedger.create({ accountName: 'Sales Account', groupType: 'Income', balanceType: 'Cr', company: companyId });
      }

      // 2. Find or create 'Accounts Receivable' or 'Cash Account' depending on payment status
      let custAccName = paymentStatus === 'Paid' ? 'Cash Account' : 'Accounts Receivable';
      let custAcc = await AccountLedger.findOne({ accountName: custAccName, company: companyId });
      if (!custAcc) {
        custAcc = await AccountLedger.create({ accountName: custAccName, groupType: 'Asset', balanceType: 'Dr', company: companyId });
      }

      // 3. Post the Voucher (Double Entry)
      await Voucher.create({
        voucherNo: `V-${invoiceNo}`,
        date: saleDate || new Date().toISOString().split('T')[0],
        voucherType: 'Sales',
        company: companyId,
        status: 'Posted',
        generalNarration: `Auto-generated voucher for Sale ${invoiceNo}`,
        entries: [
          {
            account: custAcc._id,
            debitAmount: finalGrandTotal,
            creditAmount: 0,
            narration: `Amount due from customer / cash received`
          },
          {
            account: salesAcc._id,
            debitAmount: 0,
            creditAmount: finalGrandTotal,
            narration: `Sales Revenue`
          }
        ]
      });
    } catch (vErr) {
      console.error("Voucher Auto-posting failed for Sale:", vErr);
    }
    // ----------------------------------------

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
    const query = {}; // Temporarily remove company filter for testing
    
    // Add customer filter if provided
    if (req.query.customer) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.query.customer)) {
        query.customer = req.query.customer;
      } else {
        // Find customer by name
        const CustomerReq = require('../models/Customer');
        const Customer = CustomerReq.Customer || CustomerReq;
        const customerDoc = await Customer.findOne({ name: req.query.customer });
        if (customerDoc) {
          query.customer = customerDoc._id;
        } else {
          // If customer not found by name, force an empty result
          query.customer = new mongoose.Types.ObjectId();
        }
      }
    }

    const sales = await Sale.find(query)
      .populate('salesPerson', 'username email')
      .populate('customer', 'name email phone')
      .populate('warehouse', 'name');
      
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
    const sale = await Sale.findOne({ _id: req.params.id, company: req.user.company });
    if (!sale) {
      res.status(404);
      return next(new Error('Sale not found'));
    }

    // Return stock for each item
    for (const item of sale.orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        dbProduct.currentStock = (Number(dbProduct.currentStock) || 0) + item.quantity;
        if (sale.warehouse) {
          const whIndex = dbProduct.warehouseStocks.findIndex(w => w.warehouse === sale.warehouse);
          if (whIndex >= 0) {
            dbProduct.warehouseStocks[whIndex].stock = (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) + item.quantity;
          } else {
            dbProduct.warehouseStocks.push({ warehouse: sale.warehouse, stock: item.quantity });
          }
        }
        await dbProduct.save();
      }
    }

    await Sale.findByIdAndDelete(sale._id);

    res.json({ success: true, message: 'Sale deleted successfully and stock returned' });
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
