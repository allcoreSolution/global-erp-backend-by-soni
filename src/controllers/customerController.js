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

      receipts = await Receipt.find({ $or: receiptOr })
        .sort({ receiptDate: -1, createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn('Receipt fetch skipped:', err.message);
    }

    // Returns for this customer
    let returns = [];
    try {
      const { SaleReturn } = require('../models/SaleReturn');
      returns = await SaleReturn.find({ customer: id })
        .sort({ returnDate: -1, createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn('SaleReturn fetch skipped:', err.message);
    }

    let totalSold = 0;
    let totalPaidFromSales = 0;
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;
    let cancelledInvoicesCount = 0;

    sales.forEach(s => {
      const grandTotal = Number(s.grandTotal) || 0;
      const amountPaid = Number(s.amountPaid) || 0;
      totalSold += grandTotal;
      totalPaidFromSales += amountPaid;

      if (s.saleStatus?.toLowerCase() === 'cancelled') {
        cancelledInvoicesCount++;
      } else if (s.paymentStatus?.toLowerCase() === 'paid') {
        paidInvoicesCount++;
      } else {
        pendingInvoicesCount++;
      }
    });

    const totalReceiptsRecord = receipts.reduce((sum, r) => sum + (Number(r.paymentAmount || r.totals?.received) || 0), 0);
    const totalReturnsValue = returns.reduce((sum, ret) => sum + (Number(ret.totalRefundAmount) || 0), 0);

    const openingBal = (customer.balanceType?.includes('Dr') || customer.balanceType === 'Dr (Receivable)')
      ? (Number(customer.openingBalance) || 0)
      : -(Number(customer.openingBalance) || 0);

    const netBalance = (customer.balance !== undefined && customer.balance !== null && customer.balance !== 0)
      ? customer.balance
      : Math.max(0, totalSold - totalPaidFromSales - totalReturnsValue + openingBal);

    res.json({
      success: true,
      data: {
        customer: {
          ...customer,
          companyName: customer.businessName || customer.name
        },
        sales,
        receipts,
        returns,
        summary: {
          totalSold,
          totalPaid: totalPaidFromSales + totalReceiptsRecord,
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
