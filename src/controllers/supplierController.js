const { Supplier } = require('../models/Supplier');

const createSupplier = async (req, res, next) => {
  try {
    let supplierCode = req.body.id || req.body.supplierCode;
    if (!supplierCode) {
      supplierCode = `SUP-${Date.now().toString().slice(-4)}`;
    }
    
    const payload = { ...req.body };
    delete payload.id;
    
    const companyName = payload.companyName || payload.supplierName || payload.name;
    
    const supplier = await Supplier.create({
      ...payload,
      supplierCode,
      companyName,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const getSuppliers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const suppliers = await Supplier.find(query);
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload.id;
    
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const patchSupplier = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload.id;
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, 
      { $set: payload }, 
      { new: true, runValidators: true }
    );
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// SUPPLIER LEDGER: Saare purchase suppliers ka summary hisaab-kitab
// ─────────────────────────────────────────────────────
const getSuppliersLedgerSummary = async (req, res, next) => {
  try {
    const { Purchase } = require('../models/Purchase');
    const companyId = req.user?.company || req.user?.companyId;
    const query = companyId ? { company: companyId } : {};
    
    const suppliers = await Supplier.find(query).sort({ companyName: 1 }).lean();

    const purchaseQuery = companyId ? { company: companyId } : {};
    const purchases = await Purchase.find(purchaseQuery)
      .select('supplier grandTotal amountPaid paymentStatus purchaseStatus purchaseDate')
      .lean();

    const statsMap = {};
    purchases.forEach(p => {
      const sId = p.supplier ? p.supplier.toString() : null;
      if (!sId) return;
      if (!statsMap[sId]) {
        statsMap[sId] = {
          totalInvoices: 0,
          totalPurchaseAmount: 0,
          totalPaid: 0,
          pendingInvoices: 0,
          lastPurchaseDate: null
        };
      }
      statsMap[sId].totalInvoices += 1;
      statsMap[sId].totalPurchaseAmount += Number(p.grandTotal) || 0;
      statsMap[sId].totalPaid += Number(p.amountPaid) || 0;
      if (p.paymentStatus !== 'Paid') {
        statsMap[sId].pendingInvoices += 1;
      }
      if (!statsMap[sId].lastPurchaseDate || new Date(p.purchaseDate) > new Date(statsMap[sId].lastPurchaseDate)) {
        statsMap[sId].lastPurchaseDate = p.purchaseDate;
      }
    });

    const enrichedSuppliers = suppliers.map(s => {
      const sId = s._id.toString();
      const stats = statsMap[sId] || {
        totalInvoices: 0,
        totalPurchaseAmount: 0,
        totalPaid: 0,
        pendingInvoices: 0,
        lastPurchaseDate: null
      };

      const dueAmount = (s.balance !== undefined && s.balance !== null && s.balance !== 0)
        ? s.balance
        : Math.max(0, stats.totalPurchaseAmount - stats.totalPaid);

      return {
        ...s,
        ...stats,
        dueAmount
      };
    });

    res.json({ success: true, data: enrichedSuppliers });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// SUPPLIER LEDGER DETAILS: Ek supplier ki 360° detail + saare invoices + history
// ─────────────────────────────────────────────────────
const getSupplierLedgerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Purchase } = require('../models/Purchase');
    
    const supplier = await Supplier.findById(id).lean();
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }

    // Saare invoices fetch karo with full populate
    const purchases = await Purchase.find({ supplier: id })
      .populate('warehouse', 'name code address')
      .populate('branch', 'name code')
      .populate({
        path: 'orderItems.product',
        select: 'productName productCode currentStock brand category productUnit',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      })
      .sort({ purchaseDate: -1, createdAt: -1 })
      .lean();

    // Payments to this supplier (Both Cash Payment and Bank Payment)
    let payments = [];
    try {
      const { Payment } = require('../models/Payment');
      const { BankPayment } = require('../models/BankPayment');

      const partyFilter = [
        { supplierParty: supplier.companyName },
        { supplierParty: supplier.supplierCode },
        { supplierParty: id }
      ];
      if (supplier._id) partyFilter.push({ supplierParty: supplier._id.toString() });

      const [cashPayments, bankPayments] = await Promise.all([
        Payment.find({ $or: partyFilter }).sort({ paymentDate: -1, createdAt: -1 }).lean(),
        BankPayment.find({ $or: partyFilter }).sort({ paymentDate: -1, createdAt: -1 }).lean()
      ]);

      const formattedCash = cashPayments.map(p => ({
        ...p,
        paymentTypeSource: 'Payment (Cash/General)',
        paymentAmount: Number(p.paymentAmount || p.amount || 0),
        amount: Number(p.paymentAmount || p.amount || 0),
        paymentMethod: p.paymentMethod || 'Cash',
        method: p.paymentMethod || 'Cash',
        transactionRef: p.transactionRef || p.chequeNo || '—',
        refNo: p.transactionRef || p.chequeNo || '—',
        status: p.status || 'Success'
      }));

      const formattedBank = bankPayments.map(bp => ({
        ...bp,
        paymentTypeSource: 'Bank Payment',
        paymentAmount: Number(bp.amount || bp.totals?.netPayment || 0),
        amount: Number(bp.amount || bp.totals?.netPayment || 0),
        paymentMethod: bp.method || 'Bank Transfer',
        method: bp.method || 'Bank Transfer',
        transactionRef: bp.utrNo || bp.chequeNo || '—',
        refNo: bp.utrNo || bp.chequeNo || '—',
        status: 'Success'
      }));

      // Combine and sort by date descending
      payments = [...formattedCash, ...formattedBank].sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.createdAt || 0);
        const dateB = new Date(b.paymentDate || b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (err) {
      console.warn('Payment/BankPayment fetch skipped:', err.message);
    }

    // Invoices reference list
    const invoiceNos = purchases.map(p => p.referenceNo || p.purchaseNo).filter(Boolean);

    // Returns for this supplier
    let returns = [];
    try {
      const { PurchaseReturn } = require('../models/PurchaseReturn');
      const returnOr = [{ supplier: id }];
      if (supplier.companyName) returnOr.push({ supplier: supplier.companyName });
      if (supplier.supplierCode) returnOr.push({ supplier: supplier.supplierCode });
      if (invoiceNos.length > 0) {
        returnOr.push({ referenceNo: { $in: invoiceNos } });
        returnOr.push({ purchaseNo: { $in: invoiceNos } });
      }

      const rawReturns = await PurchaseReturn.find({ $or: returnOr })
        .sort({ returnDate: -1, date: -1, createdAt: -1 })
        .lean();

      returns = rawReturns.map(r => ({
        ...r,
        returnNumber: r.returnNumber || r.returnNo || 'PR',
        returnNo: r.returnNo || r.returnNumber || 'PR',
        returnDate: r.returnDate || r.date || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '—'),
        referenceNo: r.referenceNo || r.purchaseNo || '—',
        totalRefundAmount: Number(r.grandTotal || r.totalRefundAmount || r.totalAmount || r.totals?.netAmount || r.totals?.goodsValue) || 0,
        reason: r.reason || r.returnReason || 'Purchase Return',
        status: r.status || 'Approved'
      }));
    } catch (err) {
      console.warn('PurchaseReturn fetch skipped:', err.message);
    }

    // Also fetch Debit Notes
    let debitNotes = [];
    try {
      const { DebitNote } = require('../models/DebitNote');
      const dnOr = [{ supplier: id }];
      if (supplier.companyName) dnOr.push({ supplier: supplier.companyName });
      if (supplier.supplierCode) dnOr.push({ supplier: supplier.supplierCode });
      if (invoiceNos.length > 0) {
        dnOr.push({ originalInvoiceNo: { $in: invoiceNos } });
        dnOr.push({ invoiceNo: { $in: invoiceNos } });
      }
      debitNotes = await DebitNote.find({ $or: dnOr }).lean();
    } catch (err) {
      console.warn('DebitNote fetch skipped:', err.message);
    }

    // Map returns and debit notes by invoice
    const returnByInvoice = {};
    returns.forEach(r => {
      const inv = r.referenceNo;
      if (inv && inv !== '—') {
        returnByInvoice[inv] = (returnByInvoice[inv] || 0) + (Number(r.totalRefundAmount) || 0);
      }
    });

    debitNotes.forEach(dn => {
      const inv = dn.originalInvoiceNo || dn.invoiceNo;
      const amt = Number(dn.summary?.grandTotal || dn.amount || dn.totalAmount) || 0;
      if (inv && !returnByInvoice[inv]) {
        returnByInvoice[inv] = (returnByInvoice[inv] || 0) + amt;
      }
    });

    let totalPurchased = 0;
    let totalPaidFromPurchases = 0;
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;
    let cancelledInvoicesCount = 0;

    const enrichedPurchases = purchases.map(p => {
      const grandTotal = Number(p.grandTotal) || 0;
      const amountPaid = Number(p.amountPaid) || 0;
      const invRef = p.referenceNo || p.purchaseNo;
      const returnedAmount = returnByInvoice[invRef] || returnByInvoice[p.purchaseNo] || 0;
      const balanceDue = Math.max(0, grandTotal - amountPaid - returnedAmount);

      totalPurchased += grandTotal;
      totalPaidFromPurchases += amountPaid;

      if (p.purchaseStatus?.toLowerCase() === 'cancelled') {
        cancelledInvoicesCount++;
      } else if (balanceDue === 0 || p.paymentStatus?.toLowerCase() === 'paid') {
        paidInvoicesCount++;
      } else {
        pendingInvoicesCount++;
      }

      return {
        ...p,
        returnedAmount,
        balanceDue
      };
    });

    // Unlinked (direct on-account) payments
    let unlinkedPaymentsTotal = 0;
    payments.forEach(pay => {
      const hasLinked = pay.invoices && pay.invoices.length > 0;
      if (!hasLinked) {
        unlinkedPaymentsTotal += Number(pay.paymentAmount || pay.amount || 0);
      }
    });

    const totalPaidOverall = totalPaidFromPurchases + unlinkedPaymentsTotal;
    const totalReturnsValue = returns.reduce((sum, ret) => sum + (Number(ret.totalRefundAmount) || 0), 0) ||
      debitNotes.reduce((sum, dn) => sum + (Number(dn.summary?.grandTotal || dn.amount) || 0), 0);

    const netBalance = Math.max(0, totalPurchased - totalPaidOverall - totalReturnsValue);

    res.json({
      success: true,
      data: {
        supplier,
        purchases: enrichedPurchases,
        payments,
        returns,
        debitNotes,
        summary: {
          totalPurchased,
          totalPaid: totalPaidOverall,
          totalReturns: totalReturnsValue,
          netBalance,
          totalInvoices: purchases.length,
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
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  patchSupplier,
  deleteSupplier,
  getSuppliersLedgerSummary,
  getSupplierLedgerDetails
};
