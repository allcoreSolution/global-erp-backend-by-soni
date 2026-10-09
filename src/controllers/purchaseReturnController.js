const { PurchaseReturn } = require('../models/PurchaseReturn');
const { Product } = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Create a new Purchase Return
// @route   POST /api/purchase-returns
// @access  Private
const createPurchaseReturn = async (req, res, next) => {
  try {
    const newPurchaseReturn = new PurchaseReturn({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    // Auto-deduct stock for each returned item
    // By default, stockAdjustment is true unless explicitly set to false
    const shouldAdjustStock = req.body.stockAdjustment !== false;
    
    if (shouldAdjustStock && newPurchaseReturn.items && newPurchaseReturn.items.length > 0) {
      const warehouse = newPurchaseReturn.warehouse || req.body.returnWarehouse;
      
      for (const item of newPurchaseReturn.items) {
        if (!item.product) continue;
        
        const dbProduct = await Product.findById(item.product);
        if (dbProduct) {
          // Deduct global stock
          const qty = Number(item.returnQty) || 0;
          dbProduct.currentStock = (Number(dbProduct.currentStock) || 0) - qty;

          // Deduct warehouse specific stock
          if (warehouse) {
            const whIndex = dbProduct.warehouseStocks.findIndex(
              ws => ws.warehouse && ws.warehouse.toString() === warehouse.toString()
            );
            if (whIndex > -1) {
              dbProduct.warehouseStocks[whIndex].stock = (Number(dbProduct.warehouseStocks[whIndex].stock) || 0) - qty;
            } else {
              dbProduct.warehouseStocks.push({ warehouse: warehouse, stock: -qty });
            }
          }
          await Product.updateOne(
            { _id: item.product },
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
      .sort({ createdAt: -1 });
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
    const purchaseReturn = await PurchaseReturn.findById(req.params.id);
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
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
  // Complex updates affecting stock should ideally revert old stock and apply new stock
  // For simplicity, we just update the document here (full implementation requires more robust stock diffing)
  try {
    const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(req.params.id, req.body, {
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
