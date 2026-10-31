const { Receipt } = require('../models/Receipt');
const { Sale } = require('../models/Sale');

const mongoose = require('mongoose');

// @desc    Create a new Receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res, next) => {
  try {
    const company = req.headers['x-company-id'] || req.user?.companyId || req.user?.company || req.body.company;
    let receiptNo = req.body.receiptNo;
    if (!receiptNo) {
      receiptNo = `RCP-${Date.now().toString().slice(-6)}`;
    }

    const newReceipt = await Receipt.create({
      ...req.body,
      receiptNo,
      company
    });

    // Helper to update a specific sale
    const updateSalePayment = async (invRef, amount) => {
      if (!invRef || amount <= 0) return;
      let sale = null;
      if (mongoose.Types.ObjectId.isValid(invRef)) {
        sale = await Sale.findById(invRef);
      }
      if (!sale) {
        sale = await Sale.findOne({ invoiceNo: invRef });
      }
      if (sale) {
        sale.amountPaid = (sale.amountPaid || 0) + Number(amount);
        if (sale.amountPaid >= sale.grandTotal) {
          sale.paymentStatus = 'Paid';
        } else if (sale.amountPaid > 0) {
          sale.paymentStatus = 'Partial';
        } else {
          sale.paymentStatus = 'Due';
        }
        await sale.save();
      }
    };

    // 1. Single invoice reference
    const directRef = req.body.referenceInvoice || req.body.saleId || req.body.invoiceNo;
    if (directRef) {
      await updateSalePayment(directRef, req.body.paymentAmount || req.body.amount || 0);
    }

    // 2. Multiple invoices adjustment array
    if (Array.isArray(req.body.invoices) && req.body.invoices.length > 0) {
      for (const inv of req.body.invoices) {
        const invRef = inv.invoiceNo || inv.referenceNo || inv.id || inv.invoiceId;
        const adjAmt = Number(inv.adjustAmount || inv.amount || 0);
        if (invRef && adjAmt > 0) {
          await updateSalePayment(invRef, adjAmt);
        }
      }
    }

    res.status(201).json({ success: true, data: newReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Receipts
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const receipts = await Receipt.find(query);
    res.json({ success: true, data: receipts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt
};
