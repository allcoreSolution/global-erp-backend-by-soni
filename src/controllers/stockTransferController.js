const { StockTransfer } = require('../models/StockTransfer');
const { Product } = require('../models/Product');

// Helper to transfer stock between warehouses
const updateWarehouseStock = async (productName, qty, fromWarehouse, toWarehouse) => {
  const product = await Product.findOne({ productName });
  if (!product) return;

  // Deduct from source warehouse
  if (fromWarehouse) {
    const fromIndex = product.warehouseStocks.findIndex(w => w.warehouse === fromWarehouse);
    if (fromIndex >= 0) {
      product.warehouseStocks[fromIndex].stock = (product.warehouseStocks[fromIndex].stock || 0) - qty;
    } else {
      product.warehouseStocks.push({ warehouse: fromWarehouse, stock: -qty });
    }
  }

  // Add to destination warehouse
  if (toWarehouse) {
    const toIndex = product.warehouseStocks.findIndex(w => w.warehouse === toWarehouse);
    if (toIndex >= 0) {
      product.warehouseStocks[toIndex].stock = (product.warehouseStocks[toIndex].stock || 0) + qty;
    } else {
      product.warehouseStocks.push({ warehouse: toWarehouse, stock: qty });
    }
  }

  await product.save();
};

// @desc    Create a new Stock Transfer
// @route   POST /api/stock-transfers
// @access  Private
const createStockTransfer = async (req, res, next) => {
  try {
    const newStockTransfer = await StockTransfer.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    if (newStockTransfer.items && newStockTransfer.items.length > 0) {
      for (let item of newStockTransfer.items) {
        if (item.product && item.qty) {
          await updateWarehouseStock(item.product, item.qty, newStockTransfer.fromWarehouse, newStockTransfer.toWarehouse);
        }
      }
    }

    res.status(201).json({ success: true, data: newStockTransfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Stock Transfers
// @route   GET /api/stock-transfers
// @access  Private
const getStockTransfers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const stockTransfers = await StockTransfer.find(query);
    res.json({ success: true, data: stockTransfers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Transfer by ID
// @route   GET /api/stock-transfers/:id
// @access  Private
const getStockTransferById = async (req, res, next) => {
  try {
    const stockTransfer = await StockTransfer.findById(req.params.id);
    if (!stockTransfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, data: stockTransfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Stock Transfer
// @route   PUT /api/stock-transfers/:id
// @access  Private
const updateStockTransfer = async (req, res, next) => {
  try {
    const oldTransfer = await StockTransfer.findById(req.params.id);
    if (!oldTransfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }

    // Reverse old transfer
    if (oldTransfer.items && oldTransfer.items.length > 0) {
      for (let item of oldTransfer.items) {
        if (item.product && item.qty) {
          // Reversing: from toWarehouse back to fromWarehouse
          await updateWarehouseStock(item.product, item.qty, oldTransfer.toWarehouse, oldTransfer.fromWarehouse);
        }
      }
    }

    const newTransfer = await StockTransfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Apply new transfer
    if (newTransfer.items && newTransfer.items.length > 0) {
      for (let item of newTransfer.items) {
        if (item.product && item.qty) {
          await updateWarehouseStock(item.product, item.qty, newTransfer.fromWarehouse, newTransfer.toWarehouse);
        }
      }
    }

    res.json({ success: true, data: newTransfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Stock Transfer
// @route   DELETE /api/stock-transfers/:id
// @access  Private
const deleteStockTransfer = async (req, res, next) => {
  try {
    const oldTransfer = await StockTransfer.findById(req.params.id);
    if (!oldTransfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }

    // Reverse old transfer
    if (oldTransfer.items && oldTransfer.items.length > 0) {
      for (let item of oldTransfer.items) {
        if (item.product && item.qty) {
          await updateWarehouseStock(item.product, item.qty, oldTransfer.toWarehouse, oldTransfer.fromWarehouse);
        }
      }
    }

    await StockTransfer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stock Transfer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Stock Transfers
// @route   POST /api/stock-transfers/import
// @access  Private
const importStockTransfers = async (req, res, next) => {
  try {
    const transfers = req.body;
    if (!Array.isArray(transfers) || transfers.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const transfersWithCompany = transfers.map(t => ({
      ...t,
      company: companyId || t.company
    }));

    // Use insertMany, but ignore duplicate key errors for ordered: false
    const imported = await StockTransfer.insertMany(transfersWithCompany, { ordered: false });
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
  createStockTransfer,
  getStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  deleteStockTransfer,
  importStockTransfers
};
