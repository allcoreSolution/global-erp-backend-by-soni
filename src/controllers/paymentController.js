const { Payment } = require('../models/Payment');
const { Supplier } = require('../models/Supplier');
const { Purchase } = require('../models/Purchase');

// @desc    Create a new Payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const paymentData = {
      ...req.body,
      paymentNo: req.body.paymentNo || `PAY-${Date.now().toString().slice(-6)}`,
      paymentDate: req.body.paymentDate || new Date().toISOString().slice(0, 10),
      company: req.user?.companyId || req.body.company
    };

    const newPayment = await Payment.create(paymentData);

    if (req.body.supplierParty) {
      if (mongoose.Types.ObjectId.isValid(req.body.supplierParty)) {
        await Supplier.findByIdAndUpdate(
          req.body.supplierParty,
          { $inc: { balance: -Number(req.body.paymentAmount || 0) } }
        );
      } else {
        await Supplier.findOneAndUpdate(
          { $or: [{ companyName: req.body.supplierParty }, { supplierCode: req.body.supplierParty }] },
          { $inc: { balance: -Number(req.body.paymentAmount || 0) } }
        );
      }
    }

    // Update Purchase invoices amountPaid and paymentStatus
    let adjustments = req.body.invoices || req.body.invoiceAdjustments || [];
    if ((!adjustments || adjustments.length === 0) && (req.body.purchase || req.body.purchaseInvoiceId || req.body.invoiceId || req.body.invoiceNo)) {
      const singleInvId = req.body.purchase || req.body.purchaseInvoiceId || req.body.invoiceId || req.body.invoiceNo;
      const singleAmt = Number(req.body.paymentAmount || req.body.amount || 0);
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

    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const payments = await Payment.find(query);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }

    if (payment.supplierParty) {
      await Supplier.findByIdAndUpdate(
        payment.supplierParty,
        { $inc: { balance: Number(payment.paymentAmount || 0) } }
      );
    }

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};
