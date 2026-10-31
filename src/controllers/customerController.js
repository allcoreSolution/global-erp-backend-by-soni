const { Customer } = require('../models/Customer');

const createCustomer = async (req, res, next) => {
  try {
    let customerCode = req.body.customerCode;
    if (!customerCode) {
      customerCode = `CUST-${Date.now().toString().slice(-4)}`;
    }

    const customer = await Customer.create({
      ...req.body,
      customerCode
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const customers = await Customer.find(query);
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const patchCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// CUSTOMER LEDGER: Saare customers ka summary hisaab-kitab (Sales, Paid, Due)
// ─────────────────────────────────────────────────────
const getCustomersLedgerSummary = async (req, res, next) => {
  try {
    const { Sale } = require('../models/Sale');
    const companyId = req.user?.company || req.user?.companyId;
    const query = companyId ? { company: companyId } : {};
    
    const customers = await Customer.find(query).sort({ name: 1 }).lean();

    const saleQuery = companyId ? { company: companyId } : {};
    const sales = await Sale.find(saleQuery)
      .select('customer customerMobile grandTotal amountPaid paymentStatus saleStatus saleDate invoiceNo')
      .lean();

    const statsMap = {};
    sales.forEach(s => {
      const cId = s.customer ? s.customer.toString() : null;
      if (!cId) return;
      if (!statsMap[cId]) {
        statsMap[cId] = {
          totalInvoices: 0,
          totalSaleAmount: 0,
          totalPaid: 0,
          pendingInvoices: 0,
          lastSaleDate: null
        };
      }
      statsMap[cId].totalInvoices += 1;
      statsMap[cId].totalSaleAmount += Number(s.grandTotal) || 0;
      statsMap[cId].totalPaid += Number(s.amountPaid) || 0;
      if (s.paymentStatus !== 'Paid') {
        statsMap[cId].pendingInvoices += 1;
      }
      if (!statsMap[cId].lastSaleDate || new Date(s.saleDate) > new Date(statsMap[cId].lastSaleDate)) {
        statsMap[cId].lastSaleDate = s.saleDate;
      }
    });

    const enrichedCustomers = customers.map(c => {
      const cId = c._id.toString();
      const stats = statsMap[cId] || {
        totalInvoices: 0,
        totalSaleAmount: 0,
        totalPaid: 0,
        pendingInvoices: 0,
        lastSaleDate: null
      };

      const openingBal = (c.balanceType?.includes('Dr') || c.balanceType === 'Dr (Receivable)') 
        ? (Number(c.openingBalance) || 0) 
        : -(Number(c.openingBalance) || 0);

      const dueAmount = (c.balance !== undefined && c.balance !== null && c.balance !== 0)
        ? c.balance
        : Math.max(0, stats.totalSaleAmount - stats.totalPaid + openingBal);

      return {
        ...c,
        companyName: c.businessName || c.name,
        contactPerson: c.contactPerson || c.name,
        ...stats,
        dueAmount
      };
    });

    res.json({ success: true, data: enrichedCustomers });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// CUSTOMER LEDGER DETAILS: Ek customer ki 360° detail + saare sales + receipts + returns
// ─────────────────────────────────────────────────────
const getCustomerLedgerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Sale } = require('../models/Sale');
    
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    const salesOr = [{ customer: id }];
    if (customer.phone) {
      salesOr.push({ customerMobile: customer.phone });
    }

    // Saare sales invoices fetch karo with full populate
    const sales = await Sale.find({ $or: salesOr })
      .populate('warehouse', 'name code address')
      .populate('branch', 'name code')
      .populate('salesPerson', 'name email username')
      .populate({
        path: 'orderItems.product',
        select: 'productName productCode currentStock brand category productUnit',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      })
      .sort({ saleDate: -1, createdAt: -1 })
      .lean();

    // Receipts / Payments from this customer
    let receipts = [];
    try {
      const { Receipt } = require('../models/Receipt');
      const receiptOr = [{ customerParty: id }];
      if (customer.name) receiptOr.push({ customerParty: customer.name });
      if (customer.businessName) receiptOr.push({ customerParty: customer.businessName });
      if (customer.customerCode) receiptOr.push({ customerParty: customer.customerCode });
      if (customer.phone) receiptOr.push({ contactNumber: customer.phone });

      receipts = (await Receipt.find({ $or: receiptOr })
        .sort({ receiptDate: -1, createdAt: -1 })
        .lean()).map(r => ({
          ...r,
          source: 'Cash Receipt',
          paymentAmount: Number(r.paymentAmount || r.amount || 0),
          paymentMethod: r.paymentMethod || 'Cash',
          status: r.status || 'Received'
        }));
    } catch (err) {
      console.warn('Receipt fetch skipped:', err.message);
    }

    // Bank Receipts for this customer
    let bankReceipts = [];
    try {
      const { BankReceipt } = require('../models/BankReceipt');
      const bReceiptOr = [{ customerParty: id }];
      if (customer.name) bReceiptOr.push({ customerParty: customer.name });
      if (customer.businessName) bReceiptOr.push({ customerParty: customer.businessName });
      if (customer.customerCode) bReceiptOr.push({ customerParty: customer.customerCode });
      if (customer.phone) bReceiptOr.push({ contactNumber: customer.phone });

      const rawBankReceipts = await BankReceipt.find({ $or: bReceiptOr })
        .sort({ receiptDate: -1, createdAt: -1 })
        .lean();

      bankReceipts = rawBankReceipts.map(br => ({
        ...br,
        source: 'Bank Receipt',
        paymentAmount: Number(br.amount || br.paymentAmount || 0),
        paymentMethod: br.method || br.channel || 'Bank Transfer',
        transactionRef: br.referenceNumber || br.utrNo || br.chequeNo || '—',
        status: br.status || 'Posted'
      }));
    } catch (err) {
      console.warn('BankReceipt fetch skipped:', err.message);
    }

    // Combine all receipts for customer history
    const allReceipts = [...receipts, ...bankReceipts].sort((a, b) => {
      const da = a.receiptDate ? new Date(a.receiptDate) : (a.createdAt ? new Date(a.createdAt) : 0);
      const db = b.receiptDate ? new Date(b.receiptDate) : (b.createdAt ? new Date(b.createdAt) : 0);
      return db - da;
    });

    // Map receipts by invoice
    const receiptsByInvoice = {};
    const recordAdjustment = (invNo, amt) => {
      if (invNo && amt > 0) {
        receiptsByInvoice[invNo] = (receiptsByInvoice[invNo] || 0) + Number(amt);
      }
    };

    receipts.forEach(r => {
      if (r.referenceInvoice) recordAdjustment(r.referenceInvoice, r.paymentAmount);
      if (Array.isArray(r.invoices)) {
        r.invoices.forEach(inv => recordAdjustment(inv.invoiceNo || inv.referenceNo, inv.adjustAmount));
      }
    });

    bankReceipts.forEach(br => {
      if (br.invoiceNo) recordAdjustment(br.invoiceNo, br.amount);
      if (Array.isArray(br.invoices)) {
        br.invoices.forEach(inv => recordAdjustment(inv.invoiceNo || inv.referenceNo, inv.adjustAmount));
      }
    });

    // Returns & Credit Notes for this customer
    let returns = [];
    const invoiceNos = sales.map(s => s.invoiceNo).filter(Boolean);
    try {
      const { SaleReturn } = require('../models/SaleReturn');
      const returnOr = [{ customer: id }];
      if (invoiceNos.length > 0) {
        returnOr.push({ invoiceNumber: { $in: invoiceNos } });
      }

      const rawReturns = await SaleReturn.find({ $or: returnOr })
        .sort({ date: -1, returnDate: -1, createdAt: -1 })
        .lean();

      returns = rawReturns.map(r => ({
        ...r,
        returnNumber: r.returnNumber || r.returnNo || 'SR',
        returnDate: r.returnDate || r.date || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '—'),
        invoiceNumber: r.invoiceNumber || r.invoiceNo || '—',
        totalRefundAmount: Number(r.totalRefundAmount || r.totalAmount || r.summary?.grandTotal) || 0,
        reason: r.reason || 'Sales Return',
        status: r.status || 'Approved'
      }));
    } catch (err) {
      console.warn('SaleReturn fetch skipped:', err.message);
    }

    // Also fetch Credit Notes if present
    let creditNotes = [];
    try {
      const { CreditNote } = require('../models/CreditNote');
      const cnOr = [{ customer: id }];
      if (customer.name) cnOr.push({ customer: customer.name });
      if (customer.businessName) cnOr.push({ customer: customer.businessName });
      if (invoiceNos.length > 0) {
        cnOr.push({ originalInvoiceNo: { $in: invoiceNos } });
        cnOr.push({ invoiceNo: { $in: invoiceNos } });
      }
      creditNotes = await CreditNote.find({ $or: cnOr }).lean();
    } catch (err) {
      console.warn('CreditNote fetch skipped:', err.message);
    }

    // Map returns and credit notes by invoice
    const returnByInvoice = {};
    returns.forEach(r => {
      const inv = r.invoiceNumber;
      if (inv && inv !== '—') {
        returnByInvoice[inv] = (returnByInvoice[inv] || 0) + (Number(r.totalRefundAmount) || 0);
      }
    });

    creditNotes.forEach(cn => {
      const inv = cn.originalInvoiceNo || cn.invoiceNo;
      const amt = Number(cn.summary?.grandTotal || cn.amount) || 0;
      if (inv && !returnByInvoice[inv]) {
        returnByInvoice[inv] = (returnByInvoice[inv] || 0) + amt;
      }
    });

    let totalSold = 0;
    let totalPaidFromSales = 0;
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;
    let cancelledInvoicesCount = 0;

    const enrichedSales = sales.map(s => {
      const grandTotal = Number(s.grandTotal) || 0;
      const receiptAdjusted = Math.max(
        receiptsByInvoice[s.invoiceNo] || 0,
        s._id ? (receiptsByInvoice[s._id.toString()] || 0) : 0
      );
      const amountPaid = Math.max(Number(s.amountPaid) || 0, receiptAdjusted);
      const returnedAmount = returnByInvoice[s.invoiceNo] || 0;
      const balanceDue = Math.max(0, grandTotal - amountPaid - returnedAmount);

      totalSold += grandTotal;
      totalPaidFromSales += amountPaid;

      const isCancelled = s.saleStatus?.toLowerCase() === 'cancelled';
      const isPaid = !isCancelled && balanceDue === 0;

      if (isCancelled) {
        cancelledInvoicesCount++;
      } else if (isPaid) {
        paidInvoicesCount++;
      } else {
        pendingInvoicesCount++;
      }

      return {
        ...s,
        amountPaid,
        returnedAmount,
        balanceDue,
        paymentStatus: isCancelled ? 'Cancelled' : (isPaid ? 'Paid' : (amountPaid > 0 ? 'Partial' : 'Due'))
      };
    });

    const totalReturnsValue = returns.reduce((sum, ret) => sum + (Number(ret.totalRefundAmount) || 0), 0) ||
      creditNotes.reduce((sum, cn) => sum + (Number(cn.summary?.grandTotal || cn.amount) || 0), 0);

    const openingBal = (customer.balanceType?.includes('Dr') || customer.balanceType === 'Dr (Receivable)')
      ? (Number(customer.openingBalance) || 0)
      : -(Number(customer.openingBalance) || 0);

    const netBalance = Math.max(0, totalSold - totalPaidFromSales - totalReturnsValue + openingBal);

    res.json({
      success: true,
      data: {
        customer: {
          ...customer,
          companyName: customer.businessName || customer.name
        },
        sales: enrichedSales,
        receipts: allReceipts,
        returns,
        creditNotes,
        summary: {
          totalSold,
          totalPaid: totalPaidFromSales,
          totalReturns: totalReturnsValue,
          netBalance,
          totalInvoices: sales.length,
          paidInvoicesCount,
          pendingInvoicesCount,
          cancelledInvoicesCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  patchCustomer,
  deleteCustomer,
  getCustomersLedgerSummary,
  getCustomerLedgerDetails
};
