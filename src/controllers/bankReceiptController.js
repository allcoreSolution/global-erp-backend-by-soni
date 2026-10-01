const { BankReceipt } = require('../models/BankReceipt');

// @desc    Create a new Bank Receipt
// @route   POST /api/bank-receipts
// @access  Private
const createBankReceipt = async (req, res, next) => {
  try {
    const newBankReceipt = await BankReceipt.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

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
