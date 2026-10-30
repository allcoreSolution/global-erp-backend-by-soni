const { PurchaseReturn } = require('../models/PurchaseReturn');
const { Product } = require('../models/Product');
const { Purchase } = require('../models/Purchase');
const mongoose = require('mongoose');

// @desc    Create a new Purchase Return
// @route   POST /api/purchase-returns
// @access  Private
const createPurchaseReturn = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.supplier || !mongoose.Types.ObjectId.isValid(payload.supplier)) {
      payload.supplier = null;
    }
    if (!payload.warehouse || !mongoose.Types.ObjectId.isValid(payload.warehouse)) {
      payload.warehouse = null;
    }
    if (req.user?.companyId || payload.company) {
      payload.company = req.user?.companyId || payload.company;
    }

    // Resolve Purchase ID & readable Invoice No
    if (payload.purchaseInvoice) {
      if (mongoose.Types.ObjectId.isValid(payload.purchaseInvoice)) {
        const purchaseDoc = await Purchase.findById(payload.purchaseInvoice);
        if (purchaseDoc) {
          payload.purchaseId = purchaseDoc._id;
          payload.invoiceNo = purchaseDoc.invoiceNo || purchaseDoc.billNo || purchaseDoc.purchaseNo || payload.purchaseInvoice;
          payload.purchaseInvoice = payload.invoiceNo;
        }
      } else {
        payload.invoiceNo = payload.purchaseInvoice;
      }
    }
    if (!payload.invoiceNo && payload.supplierInvoiceNo) {
      payload.invoiceNo = payload.supplierInvoiceNo;
      payload.purchaseInvoice = payload.supplierInvoiceNo;
    }

    // Ensure item product names are populated
    if (payload.items && payload.items.length > 0) {
      for (const item of payload.items) {
        if (!item.productName && item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          const prodDoc = await Product.findById(item.product);
          if (prodDoc) {
            item.productName = prodDoc.name || prodDoc.productName || '';
            if (!item.code) item.code = prodDoc.productCode || prodDoc.code || '';
          }
        }
      }
    }

    const newPurchaseReturn = new PurchaseReturn(payload);

    // Auto-deduct stock for each returned item
    // By default, stockAdjustment is true unless explicitly set to false
    const shouldAdjustStock = payload.stockAdjustment !== false;
    
    if (shouldAdjustStock && newPurchaseReturn.items && newPurchaseReturn.items.length > 0) {
      const warehouse = newPurchaseReturn.warehouse || payload.returnWarehouse;
      
      for (const item of newPurchaseReturn.items) {
        if (!item.product && !item.code && !item.productName) continue;
        
        let dbProduct = null;
        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          dbProduct = await Product.findById(item.product);
        }
        if (!dbProduct && item.code) {
          dbProduct = await Product.findOne({ productCode: item.code });
        }
        if (!dbProduct && item.productName) {
          dbProduct = await Product.findOne({ productName: item.productName });
        }

        if (dbProduct) {
          // Deduct global stock
          const qty = Number(item.returnQty) || 0;
          dbProduct.currentStock = Math.max(0, (Number(dbProduct.currentStock) || 0) - qty);

          // Deduct warehouse specific stock
          if (warehouse) {
            dbProduct.warehouseStocks = dbProduct.warehouseStocks || [];
            const whIndex = dbProduct.warehouseStocks.findIndex(
              ws => ws.warehouse && ws.warehouse.toString() === warehouse.toString()
            );
            if (whIndex > -1) {
              dbProduct.warehouseStocks[whIndex].stock = Math.max(0, (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) - qty);
            } else {
              dbProduct.warehouseStocks.push({ warehouse: warehouse, stock: 0 });
            }
          }
          await Product.updateOne(
            { _id: dbProduct._id },
            { $set: { currentStock: dbProduct.currentStock, warehouseStocks: dbProduct.warehouseStocks } }
          );
        }
      }
    }

    await newPurchaseReturn.save();

    res.status(201).json({ success: true, data: newPurchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Purchase Returns
// @route   GET /api/purchase-returns
// @access  Private
const getPurchaseReturns = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const purchaseReturns = await PurchaseReturn.find(query)
      .populate('supplier', 'supplierName companyName name')
      .populate('warehouse', 'name warehouseName')
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically guarantee human-readable invoiceNo and product names
    for (const ret of purchaseReturns) {
      if (ret.purchaseInvoice && mongoose.Types.ObjectId.isValid(ret.purchaseInvoice)) {
        const pDoc = await Purchase.findById(ret.purchaseInvoice).select('invoiceNo billNo purchaseNo');
        if (pDoc) {
          ret.invoiceNo = pDoc.invoiceNo || pDoc.billNo || pDoc.purchaseNo || ret.purchaseInvoice;
          ret.purchaseInvoice = ret.invoiceNo;
        }
      } else {
        ret.invoiceNo = ret.invoiceNo || ret.purchaseInvoice || ret.supplierInvoiceNo || '';
      }

      if (ret.items && ret.items.length > 0) {
        for (const it of ret.items) {
          if (!it.productName && it.product && mongoose.Types.ObjectId.isValid(it.product)) {
            const pr = await Product.findById(it.product).select('name productName productCode code');
            if (pr) {
              it.productName = pr.name || pr.productName || '';
              if (!it.code) it.code = pr.productCode || pr.code || '';
            }
          }
        }
      }
    }

    res.json({ success: true, data: purchaseReturns });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Purchase Return by ID
// @route   GET /api/purchase-returns/:id
// @access  Private
const getPurchaseReturnById = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id)
      .populate('supplier', 'supplierName companyName name')
      .populate('warehouse', 'name warehouseName')
      .lean();
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }

    if (purchaseReturn.purchaseInvoice && mongoose.Types.ObjectId.isValid(purchaseReturn.purchaseInvoice)) {
      const pDoc = await Purchase.findById(purchaseReturn.purchaseInvoice).select('invoiceNo billNo purchaseNo');
      if (pDoc) {
        purchaseReturn.invoiceNo = pDoc.invoiceNo || pDoc.billNo || pDoc.purchaseNo || purchaseReturn.purchaseInvoice;
        purchaseReturn.purchaseInvoice = purchaseReturn.invoiceNo;
      }
    } else {
      purchaseReturn.invoiceNo = purchaseReturn.invoiceNo || purchaseReturn.purchaseInvoice || purchaseReturn.supplierInvoiceNo || '';
    }

    if (purchaseReturn.items && purchaseReturn.items.length > 0) {
      for (const it of purchaseReturn.items) {
        if (!it.productName && it.product && mongoose.Types.ObjectId.isValid(it.product)) {
          const pr = await Product.findById(it.product).select('name productName productCode code');
          if (pr) {
            it.productName = pr.name || pr.productName || '';
            if (!it.code) it.code = pr.productCode || pr.code || '';
          }
        }
      }
    }

    res.json({ success: true, data: purchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Purchase Return
// @route   PUT /api/purchase-returns/:id
// @access  Private
const updatePurchaseReturn = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.supplier !== undefined && (!payload.supplier || !mongoose.Types.ObjectId.isValid(payload.supplier))) {
      payload.supplier = null;
    }
    if (payload.warehouse !== undefined && (!payload.warehouse || !mongoose.Types.ObjectId.isValid(payload.warehouse))) {
      payload.warehouse = null;
    }

    const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }
    res.json({ success: true, data: purchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Purchase Return
// @route   DELETE /api/purchase-returns/:id
// @access  Private
const deletePurchaseReturn = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id);
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }

    // Add stock back since the return is being cancelled/deleted
    const shouldAdjustStock = purchaseReturn.stockAdjustment !== false;
    if (shouldAdjustStock && purchaseReturn.items && purchaseReturn.items.length > 0) {
      const warehouse = purchaseReturn.warehouse || purchaseReturn.returnWarehouse;

      for (const item of purchaseReturn.items) {
        if (!item.product) continue;
        
        const dbProduct = await Product.findById(item.product);
        if (dbProduct) {
          // Add back to global stock
          const qty = Number(item.returnQty) || 0;
          dbProduct.currentStock = (Number(dbProduct.currentStock) || 0) + qty;

          // Add back to warehouse specific stock
          if (warehouse) {
            const whIndex = dbProduct.warehouseStocks.findIndex(
              ws => ws.warehouse && ws.warehouse.toString() === warehouse.toString()
            );
            if (whIndex > -1) {
              dbProduct.warehouseStocks[whIndex].stock = (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) + qty;
            } else {
              dbProduct.warehouseStocks.push({ warehouse: warehouse, stock: qty });
            }
          }
          await Product.updateOne(
            { _id: item.product },
            { $set: { currentStock: dbProduct.currentStock, warehouseStocks: dbProduct.warehouseStocks } }
          );
        }
      }
    }

    await purchaseReturn.deleteOne();

    res.json({ success: true, message: 'Purchase Return deleted successfully and stock restored.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseReturn,
  getPurchaseReturns,
  getPurchaseReturnById,
  updatePurchaseReturn,
  deletePurchaseReturn
};
