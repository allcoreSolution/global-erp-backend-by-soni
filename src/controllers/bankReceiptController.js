const { BankReceipt } = require('../models/BankReceipt');
const { Sale } = require('../models/Sale');

const mongoose = require('mongoose');

// @desc    Create a new Bank Receipt
// @route   POST /api/bank-receipts
// @access  Private
const createBankReceipt = async (req, res, next) => {
  try {
    const company = req.headers['x-company-id'] || req.user?.companyId || req.user?.company || req.body.company;
    let receiptNo = req.body.receiptNo;
    if (!receiptNo) {
      receiptNo = `BRCP-${Date.now().toString().slice(-6)}`;
    }

    const newBankReceipt = await BankReceipt.create({
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
    const directRef = req.body.referenceInvoice || req.body.invoiceNo || req.body.saleId;
    if (directRef) {
      await updateSalePayment(directRef, req.body.amount || req.body.paymentAmount || 0);
    }

    // 2. Adjustments array
    const adjustments = req.body.invoices || req.body.invoiceAdjustments;
    if (Array.isArray(adjustments) && adjustments.length > 0) {
      for (const inv of adjustments) {
        const invRef = inv.invoiceNo || inv.referenceNo || inv.id || inv.invoiceId;
        const adjAmt = Number(inv.adjustAmount || inv.amount || 0);
        if (invRef && adjAmt > 0) {
          await updateSalePayment(invRef, adjAmt);
        }
      }
    }

    res.status(201).json({ success: true, data: newBankReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Bank Receipts
// @route   GET /api/bank-receipts
// @access  Private
const getBankReceipts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const bankReceipts = await BankReceipt.find(query);
    res.json({ success: true, data: bankReceipts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bank Receipt by ID
// @route   GET /api/bank-receipts/:id
// @access  Private
const getBankReceiptById = async (req, res, next) => {
  try {
    const bankReceipt = await BankReceipt.findById(req.params.id);
    if (!bankReceipt) {
      res.status(404);
      return next(new Error('Bank Receipt not found'));
    }
    res.json({ success: true, data: bankReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Bank Receipt
// @route   PUT /api/bank-receipts/:id
// @access  Private
const updateBankReceipt = async (req, res, next) => {
  try {
    const bankReceipt = await BankReceipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bankReceipt) {
      res.status(404);
      return next(new Error('Bank Receipt not found'));
    }
    res.json({ success: true, data: bankReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Bank Receipt
// @route   DELETE /api/bank-receipts/:id
// @access  Private
const deleteBankReceipt = async (req, res, next) => {
  try {
    const bankReceipt = await BankReceipt.findByIdAndDelete(req.params.id);
    if (!bankReceipt) {
      res.status(404);
      return next(new Error('Bank Receipt not found'));
    }
    res.json({ success: true, message: 'Bank Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankReceipt,
  getBankReceipts,
  getBankReceiptById,
  updateBankReceipt,
  deleteBankReceipt
};
