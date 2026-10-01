const AccountLedger = require('../models/AccountLedger');
const Voucher = require('../models/Voucher');

const createLedger = async (req, res, next) => {
  try {
    const ledger = await AccountLedger.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: ledger });
  } catch (error) {
    next(error);
  }
};

const getLedgers = async (req, res, next) => {
  try {
    const ledgers = await AccountLedger.find({ company: req.user?.companyId }).sort({ accountName: 1 });
    res.json({ success: true, data: ledgers });
  } catch (error) {
    next(error);
  }
};

const getLedgerById = async (req, res, next) => {
  try {
    const ledger = await AccountLedger.findById(req.params.id);
    if (!ledger) {
      res.status(404);
      return next(new Error('Account Ledger not found'));
    }
    res.json({ success: true, data: ledger });
  } catch (error) {
    next(error);
  }
};

const updateLedger = async (req, res, next) => {
  try {
    const ledger = await AccountLedger.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!ledger) {
      res.status(404);
      return next(new Error('Account Ledger not found'));
    }
    res.json({ success: true, data: ledger });
  } catch (error) {
    next(error);
  }
};

const deleteLedger = async (req, res, next) => {
  try {
    // Prevent deletion if vouchers exist for this ledger
    const voucherExists = await Voucher.findOne({ 'entries.account': req.params.id });
    if (voucherExists) {
      res.status(400);
      return next(new Error('Cannot delete ledger. Vouchers are already posted using this account.'));
    }

    const ledger = await AccountLedger.findByIdAndDelete(req.params.id);
    if (!ledger) {
      res.status(404);
      return next(new Error('Account Ledger not found'));
    }
    res.json({ success: true, message: 'Account Ledger deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger
};
