const { Sale } = require('../models/Sale');
const { Purchase } = require('../models/Purchase');
const { Customer } = require('../models/Customer');
const { Supplier } = require('../models/Supplier');
const { Receipt } = require('../models/Receipt');
const { BankReceipt } = require('../models/BankReceipt');
const { Payment } = require('../models/Payment');
const { BankPayment } = require('../models/BankPayment');
const { Contra } = require('../models/Contra');
const { CreditNote } = require('../models/CreditNote');
const { DebitNote } = require('../models/DebitNote');
const AccountLedger = require('../models/AccountLedger');

// Helper to calculate days between dates
const getDaysDiff = (dateStr) => {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - d);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Get Unified Accounts & Financial Reports from active ERP models
// @route   GET /api/reports/accounts/unified-overview
// @access  Private (Admins / Accounts)
const getUnifiedAccountingOverview = async (req, res, next) => {
  try {
    const companyId = req.user?.company || req.user?.companyId;
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const { fromDate, toDate } = req.query;

    const baseFilter = (companyId && !isSuperAdmin) ? { company: companyId } : {};

    // 1. Fetch real active records in parallel
    const [
      sales,
      purchases,
      receipts,
      bankReceipts,
      payments,
      bankPayments,
      contras,
      creditNotes,
      debitNotes,
      customers,
      suppliers,
      ledgers
    ] = await Promise.all([
      Sale.find(baseFilter).populate('customer').lean(),
      Purchase.find(baseFilter).populate('supplier').lean(),
      Receipt.find(baseFilter).lean(),
      BankReceipt.find(baseFilter).lean(),
      Payment.find(baseFilter).lean(),
      BankPayment.find(baseFilter).lean(),
      Contra.find(baseFilter).lean(),
      CreditNote.find(baseFilter).lean(),
      DebitNote.find(baseFilter).lean(),
      Customer.find(baseFilter).lean(),
      Supplier.find(baseFilter).lean(),
      AccountLedger.find(baseFilter).lean()
    ]);

    // 2. Build Unified Day Book Transactions
    const dayBook = [];

    // Sales (Debit: Customer / Receivables)
    sales.forEach(s => {
      const date = s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '');
      const custName = s.customer?.name || s.customerMobile || 'Cash Customer';
      dayBook.push({
        id: `SALE_${s._id}`,
        date,
        type: 'Sale Invoice',
        category: 'Sales',
        voucherNo: s.invoiceNo,
        partyName: custName,
        partyId: s.customer?._id || s.customer,
        debit: Number(s.grandTotal || 0),
        credit: 0,
        amount: Number(s.grandTotal || 0),
        mode: s.paymentMode || 'Credit',
        status: s.paymentStatus || s.saleStatus || 'Completed',
        narration: `Sale to ${custName} (${s.orderItems?.length || 0} items)`
      });
    });

    // Purchases (Credit: Supplier / Payables)
    purchases.forEach(p => {
      const date = p.purchaseDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '');
      const suppName = p.supplier?.companyName || 'Supplier';
      dayBook.push({
        id: `PUR_${p._id}`,
        date,
        type: 'Purchase Bill',
        category: 'Purchases',
        voucherNo: p.purchaseNo || p.referenceNo || 'PUR-BILL',
        partyName: suppName,
        partyId: p.supplier?._id || p.supplier,
        debit: 0,
        credit: Number(p.grandTotal || 0),
        amount: Number(p.grandTotal || 0),
        mode: 'Supplier Credit',
        status: p.paymentStatus || p.purchaseStatus || 'Received',
        narration: `Purchase from ${suppName}`
      });
    });

    // Receipts (Credit to Customer / Debit to Cash/Bank)
    receipts.forEach(r => {
      const date = r.receiptDate || (r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '');
      dayBook.push({
        id: `RCPT_${r._id}`,
        date,
        type: 'Receipt Voucher',
        category: 'Receipts',
        voucherNo: r.receiptNo,
        partyName: r.customerParty || 'Customer',
        debit: 0,
        credit: Number(r.paymentAmount || 0),
        amount: Number(r.paymentAmount || 0),
        mode: r.paymentMethod || 'Cash',
        status: r.status || 'Received',
        narration: `Payment received via ${r.paymentMethod || 'Cash'}`
      });
    });

    // Bank Receipts
    bankReceipts.forEach(br => {
      const date = br.receiptDate || (br.createdAt ? new Date(br.createdAt).toISOString().split('T')[0] : '');
      dayBook.push({
        id: `BRCPT_${br._id}`,
        date,
        type: 'Bank Receipt',
        category: 'Receipts',
        voucherNo: br.receiptNo,
        partyName: br.customerParty || 'Customer',
        debit: 0,
        credit: Number(br.amount || 0),
        amount: Number(br.amount || 0),
        mode: br.method || 'Bank Transfer',
        status: 'Received',
        narration: `Bank receipt from ${br.customerParty || 'Party'} in ${br.bankName || 'Bank'}`
      });
    });

    // Payments (Debit to Supplier / Credit to Cash/Bank)
    payments.forEach(p => {
      const date = p.paymentDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '');
      dayBook.push({
        id: `PMT_${p._id}`,
        date,
        type: 'Payment Voucher',
        category: 'Payments',
        voucherNo: p.paymentNo,
        partyName: p.supplierParty || 'Vendor',
        debit: Number(p.paymentAmount || 0),
        credit: 0,
        amount: Number(p.paymentAmount || 0),
        mode: p.paymentMethod || 'Cash',
        status: p.status || 'Paid',
        narration: `Payment to ${p.supplierParty || 'Vendor'} via ${p.paymentMethod || 'Cash'}`
      });
    });

    // Bank Payments
    bankPayments.forEach(bp => {
      const date = bp.paymentDate || (bp.createdAt ? new Date(bp.createdAt).toISOString().split('T')[0] : '');
      dayBook.push({
        id: `BPMT_${bp._id}`,
        date,
        type: 'Bank Payment',
        category: 'Payments',
        voucherNo: bp.paymentNo,
        partyName: bp.supplierParty || 'Vendor',
        debit: Number(bp.amount || 0),
        credit: 0,
        amount: Number(bp.amount || 0),
        mode: bp.method || 'NEFT/RTGS',
        status: 'Paid',
        narration: `Bank payment to ${bp.supplierParty || 'Vendor'} (${bp.bankName || 'Bank'})`
      });
    });

    // Contra Entries
    contras.forEach(c => {
      const date = c.contraDate || (c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '');
      dayBook.push({
        id: `CON_${c._id}`,
        date,
        type: 'Contra Transfer',
        category: 'Contra',
        voucherNo: c.contraNo,
        partyName: `${c.fromAccount || 'Cash'} ➔ ${c.toAccount || 'Bank'}`,
        debit: Number(c.amount || 0),
        credit: Number(c.amount || 0),
        amount: Number(c.amount || 0),
        mode: c.transferMode || 'Transfer',
        status: c.status || 'Completed',
        narration: `Internal transfer: ${c.fromAccount} to ${c.toAccount}`
      });
    });

    // Credit Notes
    creditNotes.forEach(cn => {
      const date = cn.date || (cn.createdAt ? new Date(cn.createdAt).toISOString().split('T')[0] : '');
      const amt = Number(cn.summary?.grandTotal || cn.adjustAmount || 0);
      dayBook.push({
        id: `CN_${cn._id}`,
        date,
        type: 'Credit Note',
        category: 'Notes',
        voucherNo: cn.creditNoteNo,
        partyName: cn.customer || 'Customer',
        debit: 0,
        credit: amt,
        amount: amt,
        mode: 'Adjustment',
        status: cn.status || 'Active',
        narration: `Credit Note issued to ${cn.customer || 'Customer'}`
      });
    });

    // Debit Notes
    debitNotes.forEach(dn => {
      const date = dn.date || (dn.createdAt ? new Date(dn.createdAt).toISOString().split('T')[0] : '');
      const amt = Number(dn.summary?.grandTotal || dn.adjustAmount || 0);
      dayBook.push({
        id: `DN_${dn._id}`,
        date,
        type: 'Debit Note',
        category: 'Notes',
        voucherNo: dn.debitNoteNo,
        partyName: dn.party || 'Supplier',
        debit: amt,
        credit: 0,
        amount: amt,
        mode: 'Adjustment',
        status: dn.status || 'Active',
        narration: `Debit Note issued to ${dn.party || 'Supplier'}`
      });
    });

    // Sort Day Book descending by date
    dayBook.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Filter daybook if fromDate or toDate specified
    let filteredDayBook = dayBook;
    if (fromDate || toDate) {
      filteredDayBook = dayBook.filter(item => {
        if (fromDate && item.date < fromDate) return false;
        if (toDate && item.date > toDate) return false;
        return true;
      });
    }

    // 3. Calculate Core System Totals
    const totalSales = sales.reduce((acc, s) => acc + Number(s.grandTotal || 0), 0);
    const totalPurchases = purchases.reduce((acc, p) => acc + Number(p.grandTotal || 0), 0);

    const totalReceipts = receipts.reduce((acc, r) => acc + Number(r.paymentAmount || 0), 0) +
                          bankReceipts.reduce((acc, br) => acc + Number(br.amount || 0), 0);

    const totalPayments = payments.reduce((acc, p) => acc + Number(p.paymentAmount || 0), 0) +
                          bankPayments.reduce((acc, bp) => acc + Number(bp.amount || 0), 0);

    const totalReceivables = Math.max(0, totalSales - totalReceipts);
    const totalPayables = Math.max(0, totalPurchases - totalPayments);

    // Cash Book Calculations
    const cashIn = receipts.reduce((acc, r) => acc + (r.paymentMethod === 'Cash' ? Number(r.paymentAmount || 0) : 0), 0) +
                   sales.reduce((acc, s) => acc + (s.paymentMode === 'Cash' ? Number(s.amountPaid || s.grandTotal || 0) : 0), 0);
    const cashOut = payments.reduce((acc, p) => acc + (p.paymentMethod === 'Cash' ? Number(p.paymentAmount || 0) : 0), 0);
    const cashBalance = Math.max(0, cashIn - cashOut);

    // Bank Book Calculations
    const bankIn = bankReceipts.reduce((acc, br) => acc + Number(br.amount || 0), 0) +
                   receipts.reduce((acc, r) => acc + (['Bank', 'UPI', 'Card'].includes(r.paymentMethod) ? Number(r.paymentAmount || 0) : 0), 0);
    const bankOut = bankPayments.reduce((acc, bp) => acc + Number(bp.amount || 0), 0) +
                    payments.reduce((acc, p) => acc + (['Bank', 'UPI', 'NEFT'].includes(p.paymentMethod) ? Number(p.paymentAmount || 0) : 0), 0);
    const bankBalance = Math.max(0, bankIn - bankOut);

    const grossProfit = totalSales - totalPurchases;

    // 4. Customer Ledgers & Aging
    const customerMap = {};
    customers.forEach(c => {
      customerMap[c._id.toString()] = {
        id: c._id,
        code: c.customerCode,
        name: c.name,
        phone: c.phone || '',
        openingBalance: Number(c.openingBalance || 0),
        totalInvoiced: 0,
        totalPaid: 0,
        balanceDue: Number(c.openingBalance || 0),
        aging: { '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 },
        invoices: []
      };
    });

    sales.forEach(s => {
      const custId = s.customer?._id?.toString() || s.customer?.toString();
      if (custId && customerMap[custId]) {
        const amt = Number(s.grandTotal || 0);
        customerMap[custId].totalInvoiced += amt;
        customerMap[custId].balanceDue += amt;
        const days = getDaysDiff(s.saleDate || s.createdAt);
        if (days <= 30) customerMap[custId].aging['0_30'] += amt;
        else if (days <= 60) customerMap[custId].aging['31_60'] += amt;
        else if (days <= 90) customerMap[custId].aging['61_90'] += amt;
        else customerMap[custId].aging['90_plus'] += amt;

        customerMap[custId].invoices.push({
          invoiceNo: s.invoiceNo,
          date: s.saleDate,
          amount: amt,
          status: s.paymentStatus
        });
      }
    });

    receipts.concat(bankReceipts).forEach(r => {
      const party = (r.customerParty || '').toString().toLowerCase();
      // Match by name or ID if customerParty referenced
      const matched = Object.values(customerMap).find(c => {
        const cName = (c.name || '').toLowerCase();
        return (cName && cName === party) || (c.id && c.id.toString() === r.customerParty);
      });
      if (matched) {
        const amt = Number(r.paymentAmount || r.amount || 0);
        matched.totalPaid += amt;
        matched.balanceDue = Math.max(0, matched.balanceDue - amt);
      }
    });

    const customerLedgers = Object.values(customerMap);

    // 5. Supplier Ledgers & Aging
    const supplierMap = {};
    suppliers.forEach(s => {
      supplierMap[s._id.toString()] = {
        id: s._id,
        code: s.supplierCode,
        name: s.companyName || s.name || 'Unnamed Supplier',
        phone: s.phone || '',
        openingBalance: Number(s.balance || 0),
        totalBilled: 0,
        totalPaid: 0,
        balancePayable: Number(s.balance || 0),
        aging: { '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 },
        bills: []
      };
    });

    purchases.forEach(p => {
      const suppId = p.supplier?._id?.toString() || p.supplier?.toString();
      if (suppId && supplierMap[suppId]) {
        const amt = Number(p.grandTotal || 0);
        supplierMap[suppId].totalBilled += amt;
        supplierMap[suppId].balancePayable += amt;
        const days = getDaysDiff(p.purchaseDate || p.createdAt);
        if (days <= 30) supplierMap[suppId].aging['0_30'] += amt;
        else if (days <= 60) supplierMap[suppId].aging['31_60'] += amt;
        else if (days <= 90) supplierMap[suppId].aging['61_90'] += amt;
        else supplierMap[suppId].aging['90_plus'] += amt;

        supplierMap[suppId].bills.push({
          billNo: p.purchaseNo || p.referenceNo,
          date: p.purchaseDate,
          amount: amt,
          status: p.paymentStatus
        });
      }
    });

    payments.concat(bankPayments).forEach(p => {
      const party = (p.supplierParty || '').toString().toLowerCase();
      const matched = Object.values(supplierMap).find(s => {
        const sName = (s.name || '').toLowerCase();
        return (sName && sName === party) || (s.id && s.id.toString() === p.supplierParty);
      });
      if (matched) {
        const amt = Number(p.paymentAmount || p.amount || 0);
        matched.totalPaid += amt;
        matched.balancePayable = Math.max(0, matched.balancePayable - amt);
      }
    });

    const supplierLedgers = Object.values(supplierMap);

    // 6. Financial Statements (Dynamic Calculations)
    const trialBalance = [
      { account: 'Sales Income Account', group: 'Revenue / Income', debit: 0, credit: totalSales },
      { account: 'Cost of Goods / Purchases', group: 'Direct Expense', debit: totalPurchases, credit: 0 },
      { account: 'Sundry Debtors (Customer Receivables)', group: 'Current Assets', debit: totalReceivables, credit: 0 },
      { account: 'Sundry Creditors (Supplier Payables)', group: 'Current Liabilities', debit: 0, credit: totalPayables },
      { account: 'Cash In Hand', group: 'Current Assets', debit: cashBalance, credit: 0 },
      { account: 'Bank Accounts', group: 'Current Assets', debit: bankBalance, credit: 0 },
      { account: 'Tax & Duties Payable', group: 'Liabilities', debit: 0, credit: Math.round(totalSales * 0.18) }
    ];

    const profitAndLoss = {
      revenue: {
        totalSales,
        otherIncome: 0,
        totalRevenue: totalSales
      },
      expenses: {
        costOfPurchases: totalPurchases,
        operationalExpenses: 0,
        totalExpense: totalPurchases
      },
      grossProfit,
      netProfit: grossProfit,
      netMarginPercent: totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : '0'
    };

    const balanceSheet = {
      assets: {
        currentAssets: {
          debtorsReceivables: totalReceivables,
          cashInHand: cashBalance,
          bankBalances: bankBalance,
          total: totalReceivables + cashBalance + bankBalance
        },
        fixedAssets: 0,
        totalAssets: totalReceivables + cashBalance + bankBalance
      },
      liabilities: {
        currentLiabilities: {
          creditorsPayables: totalPayables,
          taxDuties: Math.round(totalSales * 0.18),
          total: totalPayables + Math.round(totalSales * 0.18)
        },
        equityCapital: Math.max(0, (totalReceivables + cashBalance + bankBalance) - totalPayables),
        totalLiabilities: totalReceivables + cashBalance + bankBalance
      }
    };

    res.json({
      success: true,
      metrics: {
        totalSales,
        totalPurchases,
        totalReceipts,
        totalPayments,
        totalReceivables,
        totalPayables,
        cashBalance,
        bankBalance,
        grossProfit,
        totalTransactions: dayBook.length
      },
      dayBook: filteredDayBook,
      customerLedgers,
      supplierLedgers,
      trialBalance,
      profitAndLoss,
      balanceSheet
    });
  } catch (error) {
    console.error('Unified Accounts Report Error:', error);
    next(error);
  }
};

module.exports = {
  getUnifiedAccountingOverview
};
