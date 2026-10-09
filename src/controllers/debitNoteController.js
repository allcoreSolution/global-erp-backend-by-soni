const { DebitNote } = require('../models/DebitNote');
const { Supplier } = require('../models/Supplier');
const { Product } = require('../models/Product');
const { Journal } = require('../models/Journal');

// Helper to check stock availability before deducting
const checkProductStock = async (items, warehouse) => {
  for (let item of items) {
    if (!item.product || !item.qty) continue;
    const product = await Product.findOne({ productName: item.product });
    if (!product) throw new Error(`Product not found: ${item.product}`);
    
    if ((product.currentStock || 0) < item.qty) {
      throw new Error(`Insufficient stock for ${item.product}. Available: ${product.currentStock || 0}, Requested: ${item.qty}`);
    }

    if (warehouse) {
      const wStock = product.warehouseStocks.find(w => w.warehouse === warehouse);
      const availableWStock = wStock ? (wStock.stock || 0) : 0;
      if (availableWStock < item.qty) {
        throw new Error(`Insufficient stock for ${item.product} in branch ${warehouse}. Available: ${availableWStock}, Requested: ${item.qty}`);
      }
    }
  }
};

// Helper to update supplier balance
const updateSupplierBalance = async (supplierName, amountChange) => {
  if (!supplierName) return;
  const supplier = await Supplier.findOne({ companyName: supplierName });
  if (supplier) {
    supplier.balance = (supplier.balance || 0) + amountChange;
    await supplier.save();
  }
};

// Helper to update product stock
const updateProductStock = async (productName, qtyChange, warehouse) => {
  if (!productName || !qtyChange) return;
  const product = await Product.findOne({ productName });
  if (product) {
    product.currentStock = (product.currentStock || 0) + qtyChange;
    
    if (warehouse) {
      const wIndex = product.warehouseStocks.findIndex(w => w.warehouse === warehouse);
      if (wIndex >= 0) {
        product.warehouseStocks[wIndex].stock = (product.warehouseStocks[wIndex].stock || 0) + qtyChange;
      } else {
        product.warehouseStocks.push({ warehouse, stock: qtyChange });
      }
    }
    await product.save();
  }
};

// @desc    Create a new Debit Note
// @route   POST /api/debit-notes
// @access  Private
const createDebitNote = async (req, res, next) => {
  try {
    // 0. Stock Validation BEFORE creating
    if (req.body.items && req.body.items.length > 0) {
      await checkProductStock(req.body.items, req.body.branch);
    }

    const newDebitNote = await DebitNote.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    const grandTotal = newDebitNote.summary?.grandTotal || 0;

    // 1. Decrease Supplier Balance
    await updateSupplierBalance(newDebitNote.supplier, -grandTotal);

    // 2. Decrease Stock
    if (newDebitNote.items && newDebitNote.items.length > 0) {
      for (let item of newDebitNote.items) {
        await updateProductStock(item.product, -item.qty, newDebitNote.branch);
      }
    }

    // 3. Create Accounting Journal Entry
    if (grandTotal > 0) {
      await Journal.create({
        journalNo: `JV-DN-${Date.now()}`,
        journalDate: newDebitNote.date || new Date().toISOString().split('T')[0],
        referenceNo: newDebitNote.debitNoteNo,
        referenceType: 'Debit Note',
        customerSupplier: newDebitNote.supplier,
        narration: `Debit Note issued against Invoice ${newDebitNote.originalInvoiceNo}`,
        entries: [
          {
            account: 'Accounts Payable',
            description: `Debit Note ${newDebitNote.debitNoteNo} for ${newDebitNote.supplier}`,
            debit: grandTotal,
            credit: 0
          },
          {
            account: 'Purchase Returns',
            description: `Goods returned via Debit Note ${newDebitNote.debitNoteNo}`,
            debit: 0,
            credit: grandTotal
          }
        ],
        totals: {
          debit: grandTotal,
          credit: grandTotal
        }
      });
    }

    res.status(201).json({ success: true, data: newDebitNote });
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get all Debit Notes
// @route   GET /api/debit-notes
// @access  Private
const getDebitNotes = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const debitNotes = await DebitNote.find(query);
    res.json({ success: true, data: debitNotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Debit Note by ID
// @route   GET /api/debit-notes/:id
// @access  Private
const getDebitNoteById = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.findById(req.params.id);
    if (!debitNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: debitNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Debit Note
// @route   PUT /api/debit-notes/:id
// @access  Private
const updateDebitNote = async (req, res, next) => {
  try {
    const oldNote = await DebitNote.findById(req.params.id);
    if (!oldNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }

    // 0. Stock Validation (We need to check if the new qty is available, considering we will return the old qty first)
    // For simplicity, we can do a naive check if the required additional stock is there.
    // If the new stock is more than old stock, check the difference.
    
    // Reverse Old Note Effects
    const oldGrandTotal = oldNote.summary?.grandTotal || 0;
    await updateSupplierBalance(oldNote.supplier, oldGrandTotal);
    if (oldNote.items && oldNote.items.length > 0) {
      for (let item of oldNote.items) {
        await updateProductStock(item.product, item.qty, oldNote.branch);
      }
    }

    // After reversing, check stock for the new payload
    if (req.body.items && req.body.items.length > 0) {
      try {
        await checkProductStock(req.body.items, req.body.branch);
      } catch (err) {
        // Re-apply old note effects if stock validation fails!
        await updateSupplierBalance(oldNote.supplier, -oldGrandTotal);
        if (oldNote.items && oldNote.items.length > 0) {
          for (let item of oldNote.items) {
            await updateProductStock(item.product, -item.qty, oldNote.branch);
          }
        }
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const newNote = await DebitNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Apply New Note Effects
    const newGrandTotal = newNote.summary?.grandTotal || 0;
    await updateSupplierBalance(newNote.supplier, -newGrandTotal);
    if (newNote.items && newNote.items.length > 0) {
      for (let item of newNote.items) {
        await updateProductStock(item.product, -item.qty, newNote.branch);
      }
    }

    // Update Journal Entry
    await Journal.findOneAndDelete({ referenceNo: oldNote.debitNoteNo });
    if (newGrandTotal > 0) {
      await Journal.create({
        journalNo: `JV-DN-${Date.now()}`,
        journalDate: newNote.date || new Date().toISOString().split('T')[0],
        referenceNo: newNote.debitNoteNo,
        referenceType: 'Debit Note',
        customerSupplier: newNote.supplier,
        narration: `Updated Debit Note issued against Invoice ${newNote.originalInvoiceNo}`,
        entries: [
          {
            account: 'Accounts Payable',
            description: `Debit Note ${newNote.debitNoteNo} for ${newNote.supplier}`,
            debit: newGrandTotal,
            credit: 0
          },
          {
            account: 'Purchase Returns',
            description: `Goods returned via Debit Note ${newNote.debitNoteNo}`,
            debit: 0,
            credit: newGrandTotal
          }
        ],
        totals: {
          debit: newGrandTotal,
          credit: newGrandTotal
        }
      });
    }

    res.json({ success: true, data: newNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Debit Note
// @route   DELETE /api/debit-notes/:id
// @access  Private
const deleteDebitNote = async (req, res, next) => {
  try {
    const oldNote = await DebitNote.findById(req.params.id);
    if (!oldNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }

    // Reverse Old Note Effects
    const oldGrandTotal = oldNote.summary?.grandTotal || 0;
    await updateSupplierBalance(oldNote.supplier, oldGrandTotal);
    if (oldNote.items && oldNote.items.length > 0) {
      for (let item of oldNote.items) {
        await updateProductStock(item.product, item.qty, oldNote.branch);
      }
    }

    // Delete Journal Entry
    await Journal.findOneAndDelete({ referenceNo: oldNote.debitNoteNo });

    await DebitNote.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Debit Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDebitNote,
  getDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  deleteDebitNote
};

// @desc    Import Debit Notes
// @route   POST /api/debit-notes/import
// @access  Private
const importDebitNotes = async (req, res, next) => {
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
    const imported = await DebitNote.insertMany(notesWithCompany, { ordered: false });
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
  createDebitNote,
  getDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  deleteDebitNote,
  importDebitNotes
};
