const { BankPayment } = require('../models/BankPayment');
const { Purchase } = require('../models/Purchase');

// @desc    Create a new Bank Payment
// @route   POST /api/bank-payments
// @access  Private
const createBankPayment = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const { Supplier } = require('../models/Supplier');

    const bankPaymentData = {
      ...req.body,
      paymentNo: req.body.paymentNo || `BPAY-${Date.now().toString().slice(-6)}`,
      paymentDate: req.body.paymentDate || new Date().toISOString().slice(0, 10),
      company: req.user?.companyId || req.body.company
    };

    const newBankPayment = await BankPayment.create(bankPaymentData);

    const paidAmt = Number(req.body.amount || req.body.paymentAmount || 0);
    if (req.body.supplierParty && paidAmt > 0) {
      if (mongoose.Types.ObjectId.isValid(req.body.supplierParty)) {
        await Supplier.findByIdAndUpdate(
          req.body.supplierParty,
          { $inc: { balance: -paidAmt } }
        );
      } else {
        await Supplier.findOneAndUpdate(
          { $or: [{ companyName: req.body.supplierParty }, { supplierCode: req.body.supplierParty }] },
          { $inc: { balance: -paidAmt } }
        );
      }
    }

    let adjustments = req.body.invoices || req.body.invoiceAdjustments || [];
    if ((!adjustments || adjustments.length === 0) && (req.body.purchase || req.body.purchaseInvoiceId || req.body.invoiceId || req.body.invoiceNo)) {
      const singleInvId = req.body.purchase || req.body.purchaseInvoiceId || req.body.invoiceId || req.body.invoiceNo;
      const singleAmt = paidAmt;
      adjustments = [{ id: singleInvId, amount: singleAmt }];
    }
    if (adjustments && adjustments.length > 0) {
      for (const inv of adjustments) {
        const invId = inv.id || inv.invoiceId || inv._id || inv.referenceNo || inv.invoiceNo;
        const adjAmt = Number(inv.adjustAmount || inv.amount || 0);
        if (invId && adjAmt > 0) {
          let purchase = null;
          if (mongoose.Types.ObjectId.isValid(invId)) {
            purchase = await Purchase.findById(invId);
          }
          if (!purchase) {
            purchase = await Purchase.findOne({
              $or: [{ referenceNo: invId }, { purchaseNo: invId }]
            });
          }
          if (purchase) {
            purchase.amountPaid = (purchase.amountPaid || 0) + adjAmt;
            if (purchase.amountPaid >= purchase.grandTotal) {
              purchase.paymentStatus = 'Paid';
            } else if (purchase.amountPaid > 0) {
              purchase.paymentStatus = 'Partial';
            } else {
              purchase.paymentStatus = 'Pending';
            }
            await purchase.save();
          }
        }
      }
    }

    res.status(201).json({ success: true, data: newBankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Bank Payments
// @route   GET /api/bank-payments
// @access  Private
const getBankPayments = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const bankPayments = await BankPayment.find(query);
    res.json({ success: true, data: bankPayments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bank Payment by ID
// @route   GET /api/bank-payments/:id
// @access  Private
const getBankPaymentById = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findById(req.params.id);
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, data: bankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Bank Payment
// @route   PUT /api/bank-payments/:id
// @access  Private
const updateBankPayment = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, data: bankPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Bank Payment
// @route   DELETE /api/bank-payments/:id
// @access  Private
const deleteBankPayment = async (req, res, next) => {
  try {
    const bankPayment = await BankPayment.findByIdAndDelete(req.params.id);
    if (!bankPayment) {
      res.status(404);
      return next(new Error('Bank Payment not found'));
    }
    res.json({ success: true, message: 'Bank Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankPayment,
  getBankPayments,
  getBankPaymentById,
  updateBankPayment,
  deleteBankPayment
};
