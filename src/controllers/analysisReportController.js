const AccountLedger = require('../models/AccountLedger');
const Voucher = require('../models/Voucher');

// Helper function to get ledgers and vouchers
const fetchBaseData = async (companyId, fromDate, toDate) => {
  const ledgers = await AccountLedger.find(companyId ? { company: companyId } : {}).lean();
  
  const voucherQuery = companyId ? { company: companyId } : {};
  if (fromDate || toDate) {
    voucherQuery.date = {};
    if (fromDate) voucherQuery.date.$gte = fromDate;
    if (toDate) voucherQuery.date.$lte = toDate;
  }
  
  const vouchers = await Voucher.find(voucherQuery).lean();
  return { ledgers, vouchers };
};

const getAccountWiseSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const { ledgers, vouchers } = await fetchBaseData(req.user?.companyId, fromDate, toDate);

    const summaryMap = {};
    ledgers.forEach(l => {
      summaryMap[l._id.toString()] = {
        accountId: l._id,
        accountName: l.accountName,
        groupType: l.groupType,
        totalDebit: 0,
        totalCredit: 0,
        netMovement: 0
      };
    });

    vouchers.forEach(v => {
      if (v.status !== 'Cancelled') {
        v.entries.forEach(entry => {
          const accId = entry.account.toString();
          if (summaryMap[accId]) {
            summaryMap[accId].totalDebit += (entry.debitAmount || 0);
            summaryMap[accId].totalCredit += (entry.creditAmount || 0);
          }
        });
      }
    });

    // Calculate net movement
    Object.values(summaryMap).forEach(acc => {
      if (['Asset', 'Expense'].includes(acc.groupType)) {
        acc.netMovement = acc.totalDebit - acc.totalCredit;
      } else {
        acc.netMovement = acc.totalCredit - acc.totalDebit;
      }
    });

    res.json({ success: true, data: Object.values(summaryMap) });
  } catch (error) {
    next(error);
  }
};

const getDebitCreditSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const { vouchers } = await fetchBaseData(req.user?.companyId, fromDate, toDate);

    let totalSystemDebit = 0;
    let totalSystemCredit = 0;

    vouchers.forEach(v => {
      if (v.status !== 'Cancelled') {
        totalSystemDebit += (v.totalDebit || 0);
        totalSystemCredit += (v.totalCredit || 0);
      }
    });

    res.json({
      success: true,
      data: {
        totalSystemDebit,
        totalSystemCredit,
        isBalanced: totalSystemDebit === totalSystemCredit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCashFlow = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const { ledgers, vouchers } = await fetchBaseData(req.user?.companyId, fromDate, toDate);

    // Identify Cash/Bank ledgers (simplified: accountName contains 'cash' or 'bank')
    const cashBankLedgerIds = ledgers
      .filter(l => l.accountName.toLowerCase().includes('cash') || l.accountName.toLowerCase().includes('bank'))
      .map(l => l._id.toString());

    let cashInflow = 0;
    let cashOutflow = 0;

    vouchers.forEach(v => {
      if (v.status !== 'Cancelled') {
        v.entries.forEach(entry => {
          if (cashBankLedgerIds.includes(entry.account.toString())) {
            cashInflow += (entry.debitAmount || 0); // Money received (Asset increases on Dr)
            cashOutflow += (entry.creditAmount || 0); // Money paid (Asset decreases on Cr)
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        cashInflow,
        cashOutflow,
        netLiquidityMovement: cashInflow - cashOutflow
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBankBalance = async (req, res, next) => {
  try {
    const { ledgers, vouchers } = await fetchBaseData(req.user?.companyId, null, null);

    const bankBalances = ledgers
      .filter(l => l.accountName.toLowerCase().includes('bank'))
      .map(l => ({
        accountId: l._id,
        bankName: l.accountName,
        balance: l.openingBalance || 0
      }));

    const bankMap = {};
    bankBalances.forEach(b => bankMap[b.accountId.toString()] = b);

    vouchers.forEach(v => {
      if (v.status !== 'Cancelled') {
        v.entries.forEach(entry => {
          const accId = entry.account.toString();
          if (bankMap[accId]) {
            // Asset increases on Dr, decreases on Cr
            bankMap[accId].balance += (entry.debitAmount || 0) - (entry.creditAmount || 0);
          }
        });
      }
    });

    const finalBalances = Object.values(bankMap);
    const totalBankBalance = finalBalances.reduce((sum, b) => sum + b.balance, 0);

    res.json({ success: true, data: { bankBalances: finalBalances, totalBankBalance } });
  } catch (error) {
    next(error);
  }
};

const getOpeningClosingBalance = async (req, res, next) => {
  try {
    // Requires a date range to be meaningful, but we'll calculate based on what's provided
    const { fromDate, toDate } = req.query;
    
    // Fetch all vouchers up to 'toDate' (or all if not provided)
    const allLedgers = await AccountLedger.find(req.user?.companyId ? { company: req.user?.companyId } : {}).lean();
    
    const queryToDate = {};
    if (toDate) queryToDate.date = { $lte: toDate };
    const allVouchers = await Voucher.find({ ...(req.user?.companyId ? { company: req.user?.companyId } : {}), ...queryToDate }).lean();

    const report = allLedgers.map(l => {
      const isAssetOrExpense = ['Asset', 'Expense'].includes(l.groupType);
      
      let openingBalance = l.openingBalance || 0;
      let periodDebit = 0;
      let periodCredit = 0;
      let closingBalance = openingBalance;

      allVouchers.forEach(v => {
        if (v.status !== 'Cancelled') {
          const isBeforeFromDate = fromDate ? v.date < fromDate : false;
          const isWithinPeriod = (!fromDate || v.date >= fromDate) && (!toDate || v.date <= toDate);
          
          v.entries.forEach(entry => {
            if (entry.account.toString() === l._id.toString()) {
              if (isBeforeFromDate) {
                // Affects opening balance for the requested period
                if (isAssetOrExpense) openingBalance += (entry.debitAmount || 0) - (entry.creditAmount || 0);
                else openingBalance += (entry.creditAmount || 0) - (entry.debitAmount || 0);
              }
              if (isWithinPeriod) {
                periodDebit += (entry.debitAmount || 0);
                periodCredit += (entry.creditAmount || 0);
              }
            }
          });
        }
      });

      // Calculate Closing
      if (isAssetOrExpense) {
        closingBalance = openingBalance + periodDebit - periodCredit;
      } else {
        closingBalance = openingBalance + periodCredit - periodDebit;
      }

      return {
        accountId: l._id,
        accountName: l.accountName,
        groupType: l.groupType,
        openingBalance,
        periodDebit,
        periodCredit,
        closingBalance
      };
    });

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccountWiseSummary,
  getDebitCreditSummary,
  getCashFlow,
  getBankBalance,
  getOpeningClosingBalance
};
