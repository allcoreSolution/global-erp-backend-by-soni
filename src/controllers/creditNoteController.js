const mongoose = require('mongoose');
const { CreditNote } = require('../models/CreditNote');
const { Product } = require('../models/Product');
const CustomerReq = require('../models/Customer');
const Customer = CustomerReq.Customer || CustomerReq;
const { Branch } = require('../models/Branch');
const { Warehouse } = require('../models/Warehouse');

// @desc    Create a new Credit Note
// @route   POST /api/credit-notes
// @access  Private
const createCreditNote = async (req, res, next) => {
  try {
    let customerId = req.body.customer;

    // Frontend might send Customer Name instead of ObjectId
    if (customerId && !mongoose.Types.ObjectId.isValid(customerId)) {
      const customerDoc = await Customer.findOne({ name: customerId });
      if (customerDoc) {
        customerId = customerDoc._id;
      }
    }

    const companyId = req.user?.companyId || req.user?.company || req.body.company || null;

    // Auto-generate or deduplicate creditNoteNo
    let creditNoteNo = req.body.creditNoteNo || `CN-${Math.floor(Math.random() * 90000) + 10000}`;
    const existing = await CreditNote.findOne({ creditNoteNo });
    if (existing) {
      creditNoteNo = `CN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`;
    }

    const payload = {
      ...req.body,
      creditNoteNo,
      voucherNo: req.body.voucherNo || creditNoteNo,
      noteNo: req.body.noteNo || creditNoteNo,
      customer: customerId,
      company: companyId
    };

    const newCreditNote = await CreditNote.create(payload);

    // ERP LOGIC: If it's a Sales Return, return the stock to inventory
    if (req.body.type === 'Sales Return' && req.body.items && req.body.items.length > 0) {
      const targetWarehouseInput = req.body.warehouse || req.body.branch;
      let targetWarehouseNames = [];

      if (targetWarehouseInput) {
        targetWarehouseNames.push(String(targetWarehouseInput).trim());
        const branchDoc = await Branch.findOne({
          ...(companyId ? { company: companyId } : {}),
          $or: [
            { name: targetWarehouseInput },
            ...(mongoose.isValidObjectId(targetWarehouseInput) ? [{ _id: targetWarehouseInput }] : [])
          ]
        }).catch(() => null);
        if (branchDoc) {
          targetWarehouseNames.push(branchDoc.name.trim());
          const linkedWarehouses = await Warehouse.find({ branch: branchDoc._id }).catch(() => []);
          linkedWarehouses.forEach(w => targetWarehouseNames.push(w.name.trim()));
        }
      }

      for (const item of req.body.items) {
        if (!item.product) continue;
        let prodQuery = { $or: [] };
        if (item.product) prodQuery.$or.push({ productName: item.product });
        if (item.code) prodQuery.$or.push({ productCode: item.code });
        if (mongoose.isValidObjectId(item.product)) prodQuery.$or.push({ _id: item.product });

        let dbProduct = null;
        if (companyId) {
          dbProduct = await Product.findOne({
            company: companyId,
            ...(prodQuery.$or.length ? prodQuery : { _id: null })
          });
        }
        if (!dbProduct && prodQuery.$or.length) {
          dbProduct = await Product.findOne(prodQuery);
        }
        
        if (dbProduct) {
          const qty = Number(item.qty) || 0;
          // Increase overall stock
          dbProduct.currentStock = (Number(dbProduct.currentStock) || 0) + qty;

          // Update warehouse specific stock
          if (!Array.isArray(dbProduct.warehouseStocks)) {
            dbProduct.warehouseStocks = [];
          }

          if (targetWarehouseNames.length > 0) {
            const whIndex = dbProduct.warehouseStocks.findIndex(w => 
              targetWarehouseNames.some(target => 
                String(w.warehouse).trim().toLowerCase() === target.trim().toLowerCase()
              )
            );
            if (whIndex >= 0) {
              dbProduct.warehouseStocks[whIndex].stock = (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) + qty;
            } else {
              const preferredWh = targetWarehouseNames[1] || targetWarehouseNames[0] || targetWarehouseInput;
              dbProduct.warehouseStocks.push({ warehouse: preferredWh, stock: qty });
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
          voucherType: 'Journal',
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
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate credit note number. Please try again.' });
    }
    next(error);
  }
};

// @desc    Get all Credit Notes
// @route   GET /api/credit-notes
// @access  Private
const getCreditNotes = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const query = companyId ? { company: companyId } : {};
    const creditNotes = await CreditNote.find(query).sort({ createdAt: -1 });
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
    const payload = { ...req.body };
    if (!payload.noteNo && payload.creditNoteNo) {
      payload.noteNo = payload.creditNoteNo;
    }
    if (!payload.voucherNo && payload.creditNoteNo) {
      payload.voucherNo = payload.creditNoteNo;
    }

    const creditNote = await CreditNote.findByIdAndUpdate(req.params.id, payload, {
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

    const companyId = req.user?.companyId || req.user?.company;
    const notesWithCompany = notes.map(n => ({
      ...n,
      noteNo: n.noteNo || n.creditNoteNo,
      voucherNo: n.voucherNo || n.creditNoteNo,
      company: companyId || n.company
    }));

    const imported = await CreditNote.insertMany(notesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
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
