const Voucher = require('../models/Voucher');
const AccountLedger = require('../models/AccountLedger');

const createVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const getVouchers = async (req, res, next) => {
  try {
    const filters = { company: req.user?.companyId };
    if (req.query.date) filters.date = req.query.date;
    if (req.query.voucherType) filters.voucherType = req.query.voucherType;

    const vouchers = await Voucher.find(filters)
      .populate('entries.account', 'accountName groupType')
      .sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

const getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('entries.account', 'accountName groupType');
    if (!voucher) {
      res.status(404);
      return next(new Error('Voucher not found'));
    }
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const updateVoucher = async (req, res, next) => {
  try {
    let voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      res.status(404);
      return next(new Error('Voucher not found'));
    }
    
    // Using save() to trigger the pre-save hook for double-entry validation
    Object.assign(voucher, req.body);
    await voucher.save();
    
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

const deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      res.status(404);
      return next(new Error('Voucher not found'));
    }
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Report APIs
const getLedgerStatement = async (req, res, next) => {
  try {
    const { accountId, fromDate, toDate } = req.query;
    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Account ID is required' });
    }

    const ledger = await AccountLedger.findById(accountId);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const dateFilter = {};
    if (fromDate) dateFilter.$gte = fromDate;
    if (toDate) dateFilter.$lte = toDate;
    
    const query = { 'entries.account': accountId, company: req.user?.companyId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    const vouchers = await Voucher.find(query).sort({ date: 1, createdAt: 1 }).populate('entries.account', 'accountName');
    
    let runningBalance = ledger.openingBalance;
    const isAssetOrExpense = ledger.groupType === 'Asset' || ledger.groupType === 'Expense';

    const statement = vouchers.map(v => {
      // Find the specific entry for this account
      const entry = v.entries.find(e => e.account._id.toString() === accountId);
      if (!entry) return null;

      // Update running balance (Asset/Expense increases on Dr, Liability/Income/Equity increases on Cr)
      if (isAssetOrExpense) {
        runningBalance = runningBalance + entry.debitAmount - entry.creditAmount;
      } else {
        runningBalance = runningBalance + entry.creditAmount - entry.debitAmount;
      }

      return {
        voucherId: v._id,
        voucherNo: v.voucherNo,
        date: v.date,
        voucherType: v.voucherType,
        narration: entry.narration || v.generalNarration,
        debit: entry.debitAmount,
        credit: entry.creditAmount,
        runningBalance
      };
    }).filter(Boolean);

    res.json({ 
      success: true, 
      accountInfo: {
        accountName: ledger.accountName,
        groupType: ledger.groupType,
        openingBalance: ledger.openingBalance,
        closingBalance: runningBalance
      },
      data: statement 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getLedgerStatement
};
