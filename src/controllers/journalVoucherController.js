const { JournalVoucher } = require('../models/JournalVoucher');

const createJournalVoucher = async (req, res, next) => {
  try {
    let voucherNo = req.body.voucherNo;
    if (!voucherNo) {
      voucherNo = `JV-${Date.now().toString().slice(-6)}`;
    }
    
    const voucher = await JournalVoucher.create({
      ...req.body,
      voucherNo
    });
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const getJournalVouchers = async (req, res, next) => {
  try {
    const vouchers = await JournalVoucher.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

const getJournalVoucherById = async (req, res, next) => {
  try {
    const voucher = await JournalVoucher.findById(req.params.id);
    if (!voucher) {
      res.status(404);
      return next(new Error('Journal Voucher not found'));
    }
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const updateJournalVoucher = async (req, res, next) => {
  try {
    const voucher = await JournalVoucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!voucher) {
      res.status(404);
      return next(new Error('Journal Voucher not found'));
    }
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const patchJournalVoucher = async (req, res, next) => {
  try {
    const voucher = await JournalVoucher.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!voucher) {
      res.status(404);
      return next(new Error('Journal Voucher not found'));
    }
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const deleteJournalVoucher = async (req, res, next) => {
  try {
    const voucher = await JournalVoucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      res.status(404);
      return next(new Error('Journal Voucher not found'));
    }
    res.json({ success: true, message: 'Journal Voucher deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJournalVoucher,
  getJournalVouchers,
  getJournalVoucherById,
  updateJournalVoucher,
  patchJournalVoucher,
  deleteJournalVoucher
};
