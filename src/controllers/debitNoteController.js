const mongoose = require('mongoose');
const { DebitNote } = require('../models/DebitNote');
const { Supplier } = require('../models/Supplier');
const { Product } = require('../models/Product');
const { Journal } = require('../models/Journal');
const { Branch } = require('../models/Branch');
const { Warehouse } = require('../models/Warehouse');
const { Purchase } = require('../models/Purchase');

// Helper to resolve warehouse names/IDs from branch, original purchase invoice, or warehouse input
const getTargetWarehouseNames = async (branchOrWarehouse, companyId, originalInvoiceNo) => {
  const targetNames = new Set();
  
  if (branchOrWarehouse) {
    targetNames.add(String(branchOrWarehouse).trim());
  }

  // 1. If originalInvoiceNo exists, check the Purchase document's warehouse & branch
  if (originalInvoiceNo) {
    const purchaseQuery = { purchaseNo: originalInvoiceNo };
    if (companyId) purchaseQuery.company = companyId;
    const purchaseDoc = await Purchase.findOne(purchaseQuery).catch(() => null);
    if (purchaseDoc) {
      if (purchaseDoc.warehouse) {
        targetNames.add(String(purchaseDoc.warehouse).trim());
        if (mongoose.isValidObjectId(purchaseDoc.warehouse)) {
          const wh = await Warehouse.findById(purchaseDoc.warehouse).catch(() => null);
          if (wh?.name) targetNames.add(wh.name.trim());
        }
      }
      if (purchaseDoc.branch) {
        targetNames.add(String(purchaseDoc.branch).trim());
        if (mongoose.isValidObjectId(purchaseDoc.branch)) {
          const br = await Branch.findById(purchaseDoc.branch).catch(() => null);
          if (br?.name) targetNames.add(br.name.trim());
        }
      }
    }
  }

  // 2. If branchOrWarehouse is provided, resolve Branch -> Warehouses
  if (branchOrWarehouse) {
    const branchQuery = {
      $or: [
        { name: branchOrWarehouse },
        ...(mongoose.isValidObjectId(branchOrWarehouse) ? [{ _id: branchOrWarehouse }] : [])
      ]
    };
    if (companyId) branchQuery.company = companyId;
    const branchDoc = await Branch.findOne(branchQuery).catch(() => null);
    if (branchDoc) {
      targetNames.add(branchDoc.name.trim());
      targetNames.add(branchDoc._id.toString());
      const linkedWarehouses = await Warehouse.find({ branch: branchDoc._id }).catch(() => []);
      linkedWarehouses.forEach(w => {
        targetNames.add(w.name.trim());
        targetNames.add(w._id.toString());
      });
    }

    // Also check if branchOrWarehouse is already a Warehouse name or ID
    const whQuery = {
      $or: [
        { name: branchOrWarehouse },
        ...(mongoose.isValidObjectId(branchOrWarehouse) ? [{ _id: branchOrWarehouse }] : [])
      ]
    };
    if (companyId) whQuery.company = companyId;
    const whDoc = await Warehouse.findOne(whQuery).catch(() => null);
    if (whDoc) {
      targetNames.add(whDoc.name.trim());
      targetNames.add(whDoc._id.toString());
    }
  }

  return Array.from(targetNames);
};

// Helper to check stock availability before deducting
const checkProductStock = async (items, branchOrWarehouse, companyId, originalInvoiceNo) => {
  const targetWarehouseNames = await getTargetWarehouseNames(branchOrWarehouse, companyId, originalInvoiceNo);

  for (let item of items) {
    if (!item.product || !item.qty) continue;
    const requestedQty = Number(item.qty) || 0;
    if (requestedQty <= 0) continue;

    // Search product with company scope first, fallback to global
    let product = null;
    if (companyId) {
      product = await Product.findOne({
        company: companyId,
        $or: [
          { productName: item.product },
          { productCode: item.product },
          ...(mongoose.isValidObjectId(item.product) ? [{ _id: item.product }] : [])
        ]
      });
    }
    if (!product) {
      product = await Product.findOne({
        $or: [
          { productName: item.product },
          { productCode: item.product },
          ...(mongoose.isValidObjectId(item.product) ? [{ _id: item.product }] : [])
        ]
      });
    }

    if (!product) continue;

    const currentTotalStock = Number(product.currentStock) || 0;

    // Check overall stock
    if (!product.negativeStockAllowed && currentTotalStock < requestedQty) {
      throw new Error(`Insufficient stock for ${item.product}. Available: ${currentTotalStock}, Requested: ${requestedQty}`);
    }

    // Check warehouse-specific stock only if warehouseStocks exist and matches target warehouse/branch
    if (targetWarehouseNames.length > 0 && Array.isArray(product.warehouseStocks) && product.warehouseStocks.length > 0) {
      const matchedStocks = product.warehouseStocks.filter(w => 
        targetWarehouseNames.some(target => 
          String(w.warehouse).trim().toLowerCase() === target.trim().toLowerCase()
        )
      );

      if (matchedStocks.length > 0) {
        const availableWStock = matchedStocks.reduce((sum, ws) => sum + (Number(ws.stock) || 0), 0);
        if (!product.negativeStockAllowed && availableWStock < requestedQty) {
          throw new Error(`Insufficient stock for ${item.product} in branch/warehouse ${branchOrWarehouse}. Available: ${availableWStock}, Requested: ${requestedQty}`);
        }
      }
    }
  }
};

// Helper to update supplier balance
const updateSupplierBalance = async (supplierNameOrId, amountChange, companyId) => {
  if (!supplierNameOrId || !amountChange) return;

  const query = {
    $or: [
      { companyName: supplierNameOrId },
      ...(mongoose.isValidObjectId(supplierNameOrId) ? [{ _id: supplierNameOrId }] : [])
    ]
  };
  if (companyId) query.company = companyId;

  let supplier = await Supplier.findOne(query);
  if (!supplier) {
    supplier = await Supplier.findOne({
      $or: [
        { companyName: supplierNameOrId },
        ...(mongoose.isValidObjectId(supplierNameOrId) ? [{ _id: supplierNameOrId }] : [])
      ]
    });
  }

  if (supplier) {
    supplier.balance = (Number(supplier.balance) || 0) + Number(amountChange);
    await supplier.save();
  }
};

// Helper to update product stock
const updateProductStock = async (productIdentifier, qtyChange, branchOrWarehouse, companyId, originalInvoiceNo) => {
  if (!productIdentifier || !qtyChange) return;

  const targetWarehouseNames = await getTargetWarehouseNames(branchOrWarehouse, companyId, originalInvoiceNo);

  let product = null;
  if (companyId) {
    product = await Product.findOne({
      company: companyId,
      $or: [
        { productName: productIdentifier },
        { productCode: productIdentifier },
        ...(mongoose.isValidObjectId(productIdentifier) ? [{ _id: productIdentifier }] : [])
      ]
    });
  }
  if (!product) {
    product = await Product.findOne({
      $or: [
        { productName: productIdentifier },
        { productCode: productIdentifier },
        ...(mongoose.isValidObjectId(productIdentifier) ? [{ _id: productIdentifier }] : [])
      ]
    });
  }

  if (product) {
    // 1. Update overall stock
    product.currentStock = (Number(product.currentStock) || 0) + Number(qtyChange);

    // 2. Update warehouse-specific stock
    if (!Array.isArray(product.warehouseStocks)) {
      product.warehouseStocks = [];
    }

    if (targetWarehouseNames.length > 0) {
      const wIndex = product.warehouseStocks.findIndex(w => 
        targetWarehouseNames.some(target => 
          String(w.warehouse).trim().toLowerCase() === target.trim().toLowerCase()
        )
      );

      if (wIndex >= 0) {
        product.warehouseStocks[wIndex].stock = (Number(product.warehouseStocks[wIndex].stock) || 0) + Number(qtyChange);
      } else {
        const preferredWh = targetWarehouseNames[0] || branchOrWarehouse;
        product.warehouseStocks.push({ warehouse: preferredWh, stock: Number(qtyChange) });
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
    const companyId = req.user?.companyId || req.user?.company || req.body.company || null;

    // 0. Stock Validation BEFORE creating
    if (req.body.items && req.body.items.length > 0) {
      await checkProductStock(req.body.items, req.body.branch, companyId, req.body.originalInvoiceNo);
    }

    // Auto-generate or deduplicate debitNoteNo
    let debitNoteNo = req.body.debitNoteNo || `DN-${Math.floor(Math.random() * 90000) + 10000}`;
    const existing = await DebitNote.findOne({ debitNoteNo });
    if (existing) {
      debitNoteNo = `DN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`;
    }

    const newDebitNote = await DebitNote.create({
      ...req.body,
      debitNoteNo,
      voucherNo: req.body.voucherNo || debitNoteNo,
      noteNo: req.body.noteNo || debitNoteNo,
      company: companyId
    });

    const grandTotal = newDebitNote.summary?.grandTotal || 0;

    // 1. Decrease Supplier Balance
    await updateSupplierBalance(newDebitNote.supplier, -grandTotal, companyId);

    // 2. Decrease Stock
    if (newDebitNote.items && newDebitNote.items.length > 0) {
      for (let item of newDebitNote.items) {
        await updateProductStock(item.product, -item.qty, newDebitNote.branch, companyId, newDebitNote.originalInvoiceNo);
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
    const companyId = req.user?.companyId || req.user?.company;
    const query = companyId ? { company: companyId } : {};
    const debitNotes = await DebitNote.find(query).sort({ createdAt: -1 });
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
    const companyId = req.user?.companyId || req.body.company || null;
    const oldNote = await DebitNote.findById(req.params.id);
    if (!oldNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }

    const oldCompanyId = oldNote.company || companyId;

    // Reverse Old Note Effects
    const oldGrandTotal = oldNote.summary?.grandTotal || 0;
    await updateSupplierBalance(oldNote.supplier, oldGrandTotal, oldCompanyId);
    if (oldNote.items && oldNote.items.length > 0) {
      for (let item of oldNote.items) {
        await updateProductStock(item.product, item.qty, oldNote.branch, oldCompanyId, oldNote.originalInvoiceNo);
      }
    }

    // After reversing, check stock for the new payload
    if (req.body.items && req.body.items.length > 0) {
      try {
        await checkProductStock(req.body.items, req.body.branch, companyId, req.body.originalInvoiceNo);
      } catch (err) {
        // Re-apply old note effects if stock validation fails!
        await updateSupplierBalance(oldNote.supplier, -oldGrandTotal, oldCompanyId);
        if (oldNote.items && oldNote.items.length > 0) {
          for (let item of oldNote.items) {
            await updateProductStock(item.product, -item.qty, oldNote.branch, oldCompanyId, oldNote.originalInvoiceNo);
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
    await updateSupplierBalance(newNote.supplier, -newGrandTotal, companyId);
    if (newNote.items && newNote.items.length > 0) {
      for (let item of newNote.items) {
        await updateProductStock(item.product, -item.qty, newNote.branch, companyId, newNote.originalInvoiceNo);
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

    const companyId = oldNote.company || req.user?.companyId;

    // Reverse Old Note Effects
    const oldGrandTotal = oldNote.summary?.grandTotal || 0;
    await updateSupplierBalance(oldNote.supplier, oldGrandTotal, companyId);
    if (oldNote.items && oldNote.items.length > 0) {
      for (let item of oldNote.items) {
        await updateProductStock(item.product, item.qty, oldNote.branch, companyId, oldNote.originalInvoiceNo);
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

    const imported = await DebitNote.insertMany(notesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
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
