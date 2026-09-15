const { Payment } = require('../models/Payment');

// @desc    Create a new Payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const newPayment = await Payment.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const payments = await Payment.find(query);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};
