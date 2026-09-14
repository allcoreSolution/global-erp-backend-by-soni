const { BankPayment } = require('../models/BankPayment');

const createBankPayment = async (req, res, next) => {
  try {
    let paymentId = req.body.paymentId;
    if (!paymentId) {
      paymentId = `BPMT-${Date.now().toString().slice(-6)}`;
    }
    
    const payment = await BankPayment.create({
      ...req.body,
      paymentId
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getBankPayments = async (req, res, next) => {
  try {
    const payments = await BankPayment.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getBankPaymentById = async (req, res, next) => {
  try {
    const payment = await BankPayment.findById(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Bank Payment record not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const updateBankPayment = async (req, res, next) => {
  try {
    const payment = await BankPayment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) {
      res.status(404);
      return next(new Error('Bank Payment record not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const patchBankPayment = async (req, res, next) => {
  try {
    const payment = await BankPayment.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!payment) {
      res.status(404);
      return next(new Error('Bank Payment record not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const deleteBankPayment = async (req, res, next) => {
  try {
    const payment = await BankPayment.findByIdAndDelete(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Bank Payment record not found'));
    }
    res.json({ success: true, message: 'Bank Payment record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankPayment,
  getBankPayments,
  getBankPaymentById,
  updateBankPayment,
  patchBankPayment,
  deleteBankPayment
};
