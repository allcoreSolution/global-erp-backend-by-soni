const AccountLedger = require('../models/AccountLedger');
const Voucher = require('../models/Voucher');

// Helper function to calculate closing balance of a ledger based on its vouchers
const calculateBalances = async (companyId, groupFilter = null) => {
  const query = companyId ? { company: companyId } : {};
  if (groupFilter) query.groupType = { $in: groupFilter };

  const ledgers = await AccountLedger.find(query).lean();
  const vouchers = await Voucher.find(companyId ? { company: companyId } : {}).lean();

  const ledgerMap = {};
  ledgers.forEach(l => {
    ledgerMap[l._id.toString()] = {
      ...l,
      totalDebit: 0,
      totalCredit: 0,
      closingBalance: l.openingBalance || 0
    };
  });

  vouchers.forEach(v => {
    if (v.status !== 'Cancelled') {
      v.entries.forEach(entry => {
        const accId = entry.account.toString();
        if (ledgerMap[accId]) {
          ledgerMap[accId].totalDebit += (entry.debitAmount || 0);
          ledgerMap[accId].totalCredit += (entry.creditAmount || 0);
          
          // Assets and Expenses increase on Debit
          if (['Asset', 'Expense'].includes(ledgerMap[accId].groupType)) {
            ledgerMap[accId].closingBalance += (entry.debitAmount || 0) - (entry.creditAmount || 0);
          } else {
            // Liabilities, Equity, Income increase on Credit
            ledgerMap[accId].closingBalance += (entry.creditAmount || 0) - (entry.debitAmount || 0);
          }
        }
      });
    }
  });

  return Object.values(ledgerMap);
};

const getTrialBalance = async (req, res, next) => {
  try {
    const balances = await calculateBalances(req.user?.companyId);
    
    let totalDebitBalance = 0;
    let totalCreditBalance = 0;

    const trialBalance = balances.map(acc => {
      // For Trial Balance, we normally show absolute Dr or Cr balances
      let drBalance = 0;
      let crBalance = 0;

      if (['Asset', 'Expense'].includes(acc.groupType)) {
        if (acc.closingBalance > 0) drBalance = acc.closingBalance;
        else crBalance = Math.abs(acc.closingBalance);
      } else {
        if (acc.closingBalance > 0) crBalance = acc.closingBalance;
        else drBalance = Math.abs(acc.closingBalance);
      }

      totalDebitBalance += drBalance;
      totalCreditBalance += crBalance;

      return {
        accountId: acc._id,
        accountName: acc.accountName,
        groupType: acc.groupType,
        debit: drBalance,
        credit: crBalance
      };
    });

    res.json({
      success: true,
      totals: { debit: totalDebitBalance, credit: totalCreditBalance, isBalanced: totalDebitBalance === totalCreditBalance },
      data: trialBalance
    });
  } catch (error) {
    next(error);
  }
};

const getProfitAndLoss = async (req, res, next) => {
  try {
    const balances = await calculateBalances(req.user?.companyId, ['Income', 'Expense']);
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    const incomes = [];
    const expenses = [];

    balances.forEach(acc => {
      if (acc.groupType === 'Income') {
        totalIncome += acc.closingBalance;
        incomes.push({ accountName: acc.accountName, amount: acc.closingBalance });
      } else if (acc.groupType === 'Expense') {
        totalExpense += acc.closingBalance;
        expenses.push({ accountName: acc.accountName, amount: acc.closingBalance });
      }
    });

    const netProfit = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        incomes,
        expenses,
        totalIncome,
        totalExpense,
        netProfit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBalanceSheet = async (req, res, next) => {
  try {
    // We need Assets, Liabilities, Equity AND the Net Profit
    const allBalances = await calculateBalances(req.user?.companyId);
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    
    let totalIncome = 0;
    let totalExpense = 0;

    const assets = [];
    const liabilities = [];
    const equity = [];

    allBalances.forEach(acc => {
      if (acc.groupType === 'Asset') {
        totalAssets += acc.closingBalance;
        assets.push({ accountName: acc.accountName, amount: acc.closingBalance });
      } else if (acc.groupType === 'Liability') {
        totalLiabilities += acc.closingBalance;
        liabilities.push({ accountName: acc.accountName, amount: acc.closingBalance });
      } else if (acc.groupType === 'Equity') {
        totalEquity += acc.closingBalance;
        equity.push({ accountName: acc.accountName, amount: acc.closingBalance });
      } else if (acc.groupType === 'Income') {
        totalIncome += acc.closingBalance;
      } else if (acc.groupType === 'Expense') {
        totalExpense += acc.closingBalance;
      }
    });

    const netProfit = totalIncome - totalExpense;
    // Add net profit to equity side
    totalEquity += netProfit;
    equity.push({ accountName: 'Retained Earnings (Net Profit)', amount: netProfit });

    res.json({
      success: true,
      data: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: totalAssets === (totalLiabilities + totalEquity)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOutstanding = async (req, res, next) => {
  try {
    const { type } = req.query; // 'receivable' or 'payable'
    if (!type || !['receivable', 'payable'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Valid type (receivable, payable) is required' });
    }

    // In a real ERP, we'd filter by Customer/Supplier ledgers.
    // Assuming 'Asset' for Customers (Receivables) and 'Liability' for Suppliers (Payables)
    // Here we'll just check all ledgers and show those with a balance indicating money owed/owing.
    const balances = await calculateBalances(req.user?.companyId);
    
    const outstanding = [];
    let totalOutstanding = 0;

    balances.forEach(acc => {
      // Receivable: Asset with Dr balance
      if (type === 'receivable' && acc.groupType === 'Asset' && acc.closingBalance > 0 && acc.accountName.toLowerCase() !== 'cash') {
        outstanding.push({ accountName: acc.accountName, amount: acc.closingBalance });
        totalOutstanding += acc.closingBalance;
      }
      // Payable: Liability with Cr balance
      else if (type === 'payable' && acc.groupType === 'Liability' && acc.closingBalance > 0) {
        outstanding.push({ accountName: acc.accountName, amount: acc.closingBalance });
        totalOutstanding += acc.closingBalance;
      }
    });

    res.json({ success: true, data: { records: outstanding, total: totalOutstanding } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
  getOutstanding
};
