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
    
    if (req.query.fromDate || req.query.toDate) {
      filters.date = {};
      if (req.query.fromDate) filters.date.$gte = req.query.fromDate;
      if (req.query.toDate) filters.date.$lte = req.query.toDate;
    } else if (req.query.date) {
      filters.date = req.query.date;
    }

    if (req.query.voucherType && req.query.voucherType !== 'All') filters.voucherType = req.query.voucherType;
    if (req.query.status && req.query.status !== 'All') filters.status = req.query.status;
    if (req.query.accountId && req.query.accountId !== 'All') filters['entries.account'] = req.query.accountId;

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

// @desc    Import Vouchers
// @route   POST /api/vouchers/import
// @access  Private
const importVouchers = async (req, res, next) => {
  try {
    const vouchers = req.body;
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const vouchersWithCompany = vouchers.map(v => {
      let totalDr = 0;
      let totalCr = 0;
      if (v.entries && v.entries.length > 0) {
        v.entries.forEach(e => {
          totalDr += Number(e.debitAmount) || 0;
          totalCr += Number(e.creditAmount) || 0;
        });
      }
      return {
        ...v,
        totalDebit: totalDr,
        totalCredit: totalCr,
        company: companyId || v.company
      };
    });

    const imported = await Voucher.insertMany(vouchersWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(207).json({ success: true, message: 'Imported with some duplicate errors', count: error.insertedDocs?.length || 0 });
    }
    next(error);
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getLedgerStatement,
  importVouchers
};
