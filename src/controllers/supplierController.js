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

    // Payments to this supplier
    let payments = [];
    try {
      const { Payment } = require('../models/Payment');
      payments = await Payment.find({
        $or: [
          { supplierParty: supplier.companyName },
          { supplierParty: supplier.supplierCode },
          { supplierParty: id }
        ]
      }).sort({ paymentDate: -1 }).lean();
    } catch (err) {
      console.warn('Payment fetch skipped:', err.message);
    }

    // Returns for this supplier
    let returns = [];
    try {
      const { PurchaseReturn } = require('../models/PurchaseReturn');
      returns = await PurchaseReturn.find({
        $or: [
          { supplier: id },
          { supplier: supplier.companyName }
        ]
      }).sort({ returnDate: -1 }).lean();
    } catch (err) {
      console.warn('PurchaseReturn fetch skipped:', err.message);
    }

    let totalPurchased = 0;
    let totalPaidFromPurchases = 0;
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;
    let cancelledInvoicesCount = 0;

    purchases.forEach(p => {
      const grandTotal = Number(p.grandTotal) || 0;
      const amountPaid = Number(p.amountPaid) || 0;
      totalPurchased += grandTotal;
      totalPaidFromPurchases += amountPaid;

      if (p.purchaseStatus?.toLowerCase() === 'cancelled') {
        cancelledInvoicesCount++;
      } else if (p.paymentStatus?.toLowerCase() === 'paid') {
        paidInvoicesCount++;
      } else {
        pendingInvoicesCount++;
      }
    });

    const totalPaymentsRecord = payments.reduce((sum, pay) => sum + (Number(pay.paymentAmount) || 0), 0);
    const totalReturnsValue = returns.reduce((sum, ret) => sum + (Number(ret.totals?.netAmount || ret.totals?.goodsValue) || 0), 0);

    const netBalance = (supplier.balance !== undefined && supplier.balance !== null && supplier.balance !== 0)
      ? supplier.balance
      : Math.max(0, totalPurchased - totalPaidFromPurchases - totalReturnsValue);

    res.json({
      success: true,
      data: {
        supplier,
        purchases,
        payments,
        returns,
        summary: {
          totalPurchased,
          totalPaid: totalPaidFromPurchases + totalPaymentsRecord,
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
