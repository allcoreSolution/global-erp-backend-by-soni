const { CreditNote } = require('../models/CreditNote');

const { Product } = require('../models/Product');
const CustomerReq = require('../models/Customer');
const Customer = CustomerReq.Customer || CustomerReq;

// @desc    Create a new Credit Note
// @route   POST /api/credit-notes
// @access  Private
const createCreditNote = async (req, res, next) => {
  try {
    let customerId = req.body.customer;

    // Frontend might send Customer Name instead of ObjectId
    const mongoose = require('mongoose');
    if (customerId && !mongoose.Types.ObjectId.isValid(customerId)) {
      const customerDoc = await Customer.findOne({ name: customerId });
      if (customerDoc) {
        customerId = customerDoc._id;
      }
    }

    const payload = {
      ...req.body,
      customer: customerId,
      company: req.user?.companyId || req.body.company
    };

    const newCreditNote = await CreditNote.create(payload);

    // ERP LOGIC: If it's a Sales Return, return the stock to inventory
    if (req.body.type === 'Sales Return' && req.body.items && req.body.items.length > 0) {
      const targetWarehouseName = req.body.branch; // Or warehouse if provided

      for (const item of req.body.items) {
        // Find product by name or code
        let prodQuery = { $or: [] };
        if (item.product) prodQuery.$or.push({ productName: item.product });
        if (item.code) prodQuery.$or.push({ productCode: item.code });

        const dbProduct = await Product.findOne(prodQuery.$or.length ? prodQuery : { _id: null });
        
        if (dbProduct) {
          // Increase stock
          dbProduct.currentStock = (Number(dbProduct.currentStock) || 0) + Number(item.qty);

          // Update warehouse specific stock
          if (targetWarehouseName) {
            if (!dbProduct.warehouseStocks) dbProduct.warehouseStocks = [];
            const whIndex = dbProduct.warehouseStocks.findIndex(w => w.warehouse === targetWarehouseName);
            if (whIndex >= 0) {
              dbProduct.warehouseStocks[whIndex].stock = (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) + Number(item.qty);
            } else {
              dbProduct.warehouseStocks.push({ warehouse: targetWarehouseName, stock: Number(item.qty) });
            }
          }
          await dbProduct.save();
        }
      }
    }

    // ERP LOGIC: Auto-Voucher Creation for Day Book
    try {
      const Voucher = require('../models/Voucher');
      const AccountLedger = require('../models/AccountLedger');
      
      const companyId = req.user?.companyId || req.body.company || null;
      const totalAmount = newCreditNote.summary?.grandTotal || 0;

      if (totalAmount > 0) {
        // Find or create 'Sales Return Account' (or Discount)
        let returnAccName = req.body.type === 'Discount Given' ? 'Discount Allowed' : 'Sales Return Account';
        let returnAcc = await AccountLedger.findOne({ accountName: returnAccName, company: companyId });
        if (!returnAcc) {
          returnAcc = await AccountLedger.create({ accountName: returnAccName, groupType: 'Expense', balanceType: 'Dr', company: companyId });
        }

        // Find or create 'Accounts Receivable' (Customer)
        let custAcc = await AccountLedger.findOne({ accountName: 'Accounts Receivable', company: companyId });
        if (!custAcc) {
          custAcc = await AccountLedger.create({ accountName: 'Accounts Receivable', groupType: 'Asset', balanceType: 'Dr', company: companyId });
        }

        // Post Voucher
        await Voucher.create({
          voucherNo: `V-${newCreditNote.creditNoteNo}`,
          date: newCreditNote.date || new Date().toISOString().split('T')[0],
          voucherType: 'Journal', // Using Journal for adjustments
          company: companyId,
          status: 'Posted',
          generalNarration: `Auto-generated voucher for Credit Note ${newCreditNote.creditNoteNo}`,
          entries: [
            {
              account: returnAcc._id,
              debitAmount: totalAmount,
              creditAmount: 0,
              narration: `Sales Return / Discount`
            },
            {
              account: custAcc._id,
              debitAmount: 0,
              creditAmount: totalAmount,
              narration: `Customer balance reduced`
            }
          ]
        });
      }
    } catch (vErr) {
      console.error("Voucher Auto-posting failed for Credit Note:", vErr);
    }

    res.status(201).json({ success: true, data: newCreditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Credit Notes
// @route   GET /api/credit-notes
// @access  Private
const getCreditNotes = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const creditNotes = await CreditNote.find(query);
    res.json({ success: true, data: creditNotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Credit Note by ID
// @route   GET /api/credit-notes/:id
// @access  Private
const getCreditNoteById = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id);
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Credit Note
// @route   PUT /api/credit-notes/:id
// @access  Private
const updateCreditNote = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Credit Note
// @route   DELETE /api/credit-notes/:id
// @access  Private
const deleteCreditNote = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findByIdAndDelete(req.params.id);
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, message: 'Credit Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Credit Notes
// @route   POST /api/credit-notes/import
// @access  Private
const importCreditNotes = async (req, res, next) => {
  try {
    const notes = req.body;
    if (!Array.isArray(notes) || notes.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const notesWithCompany = notes.map(n => ({
      ...n,
      company: companyId || n.company
    }));

    // Use insertMany, but ignore duplicate key errors for ordered: false
    const imported = await CreditNote.insertMany(notesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
      // Partial success if some failed due to duplicate keys
      return res.status(207).json({ success: true, message: 'Imported with some duplicate errors', count: error.insertedDocs?.length || 0 });
    }
    next(error);
  }
};

module.exports = {
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  updateCreditNote,
  deleteCreditNote,
  importCreditNotes
};
