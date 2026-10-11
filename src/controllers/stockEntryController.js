const { StockEntry } = require('../models/StockEntry');
const { Product } = require('../models/Product');

// Helper to update product stock and warehouse-specific stock
const updateProductStock = async (productName, qty, warehouseName) => {
  const product = await Product.findOne({ productName });
  if (!product) return;

  product.currentStock = (product.currentStock || 0) + qty;

  if (warehouseName) {
    const whIndex = product.warehouseStocks.findIndex(w => w.warehouse === warehouseName);
    if (whIndex >= 0) {
      product.warehouseStocks[whIndex].stock = (product.warehouseStocks[whIndex].stock || 0) + qty;
    } else {
      product.warehouseStocks.push({ warehouse: warehouseName, stock: qty });
    }
  }

  await product.save();
};

// @desc    Create a new Stock Entry
// @route   POST /api/stock-entries
// @access  Private
const createStockEntry = async (req, res, next) => {
  try {
    const newStockEntry = await StockEntry.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    // Update main and warehouse stock
    if (newStockEntry.products && newStockEntry.products.length > 0) {
      for (let item of newStockEntry.products) {
        if (item.product && item.qty) {
          await updateProductStock(item.product, item.qty, newStockEntry.warehouseBase);
        }
      }
    }

    res.status(201).json({ success: true, data: newStockEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Stock Entries
// @route   GET /api/stock-entries
// @access  Private
const getStockEntries = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const stockEntries = await StockEntry.find(query);
    res.json({ success: true, data: stockEntries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Entry by ID
// @route   GET /api/stock-entries/:id
// @access  Private
const getStockEntryById = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findById(req.params.id);
    if (!stockEntry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
    res.json({ success: true, data: stockEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Stock Entry
// @route   PUT /api/stock-entries/:id
// @access  Private
const updateStockEntry = async (req, res, next) => {
  try {
    const oldEntry = await StockEntry.findById(req.params.id);
    if (!oldEntry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }

    // Reverse old entry's stock
    if (oldEntry.products && oldEntry.products.length > 0) {
      for (let item of oldEntry.products) {
        if (item.product && item.qty) {
          await updateProductStock(item.product, -item.qty, oldEntry.warehouseBase);
        }
      }
    }

    const newEntry = await StockEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Apply new entry's stock
    if (newEntry.products && newEntry.products.length > 0) {
      for (let item of newEntry.products) {
        if (item.product && item.qty) {
          await updateProductStock(item.product, item.qty, newEntry.warehouseBase);
        }
      }
    }

    res.json({ success: true, data: newEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Stock Entry
// @route   DELETE /api/stock-entries/:id
// @access  Private
const deleteStockEntry = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findById(req.params.id);
    if (!stockEntry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }

    // Reverse stock before deleting
    if (stockEntry.products && stockEntry.products.length > 0) {
      for (let item of stockEntry.products) {
        if (item.product && item.qty) {
          await updateProductStock(item.product, -item.qty, stockEntry.warehouseBase);
        }
      }
    }

    await StockEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stock Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStockEntry,
  getStockEntries,
  getStockEntryById,
  updateStockEntry,
  deleteStockEntry
};
