const { BankPayment } = require('../models/BankPayment');

// @desc    Create a new Bank Payment
// @route   POST /api/bank-payments
// @access  Private
const createBankPayment = async (req, res, next) => {
  try {
    const newBankPayment = await BankPayment.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newBankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Bank Payments
// @route   GET /api/bank-payments
// @access  Private
const getBankPayments = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const bankPayments = await BankPayment.find(query);
    res.json({ success: true, data: bankPayments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bank Payment by ID
// @route   GET /api/bank-payments/:id
// @access  Private
const getBankPaymentById = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findById(req.params.id);
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, data: bankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Bank Payment
// @route   PUT /api/bank-payments/:id
// @access  Private
const updateBankPayment = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, data: bankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Bank Payment
// @route   DELETE /api/bank-payments/:id
// @access  Private
const deleteBankPayment = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findByIdAndDelete(req.params.id);
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, message: 'Bank Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankPayment,
  getBankPayments,
  getBankPaymentById,
  updateBankPayment,
  deleteBankPayment
};
