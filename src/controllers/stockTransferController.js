const mongoose = require('mongoose');
const { StockTransfer } = require('../models/StockTransfer');
const { Product } = require('../models/Product');
const Company = require('../models/Company');

const getQueryById = (idParam, company, isSuperAdmin) => {
  const or = [];
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    or.push({ _id: idParam });
  }
  or.push({ transferNo: idParam });
  or.push({ voucherNo: idParam });

  if (company && !isSuperAdmin) {
    return { company, $or: or };
  }
  return { $or: or };
};

// Helper to transfer stock between warehouses
const updateWarehouseStock = async (productName, qty, fromWarehouse, toWarehouse) => {
  try {
    const product = await Product.findOne({
      $or: [
        { productName },
        { name: productName },
        { productCode: productName },
        { code: productName }
      ]
    });
    if (!product) return;

    if (!Array.isArray(product.warehouseStocks)) {
      product.warehouseStocks = [];
    }

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
  } catch (err) {
    console.error('Error updating warehouse stock:', err.message);
  }
};

// @desc    Create a new Stock Transfer
// @route   POST /api/stock-transfers
// @access  Private
const createStockTransfer = async (req, res, next) => {
  try {
    let company = req.user?.companyId || req.user?.company || req.body.company || '';
    if (!company) {
      const firstCompany = await Company.findOne({ isActive: true });
      if (firstCompany) {
        company = firstCompany._id.toString();
      }
    }

    let transferNo = req.body.transferNo;

    // Check collision in company
    const filter = company ? { company, transferNo } : { transferNo };
    const exists = transferNo ? await StockTransfer.collection.findOne(filter) : false;

    if (!transferNo || exists) {
      const companyQuery = company ? { company } : {};
      const allTransfers = await StockTransfer.collection.find(companyQuery, { projection: { transferNo: 1 } }).toArray();
      let maxNum = 0;
      for (const t of allTransfers) {
        const val = t.transferNo || '';
        const match = String(val).match(/\d+/g);
        if (match) {
          const num = parseInt(match[match.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      transferNo = `ST-${new Date().getFullYear()}-${String(maxNum + 1).padStart(5, '0')}`;
      while (await StockTransfer.collection.findOne(company ? { company, transferNo } : { transferNo })) {
        maxNum++;
        transferNo = `ST-${new Date().getFullYear()}-${String(maxNum).padStart(5, '0')}`;
      }
    }

    const newStockTransfer = await StockTransfer.create({
      ...req.body,
      transferNo,
      voucherNo: transferNo,
      company
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
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const company = req.user?.companyId || req.user?.company || '';
    
    // SuperAdmin or no company filter returns all transfers
    const query = (isSuperAdmin || !company) 
      ? {} 
      : { $or: [{ company }, { company: { $exists: false } }, { company: null }, { company: '' }] };

    const stockTransfers = await StockTransfer.find(query).sort({ createdAt: -1 });
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
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company, isSuperAdmin);
    const stockTransfer = await StockTransfer.findOne(query);
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
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company, isSuperAdmin);
    const oldTransfer = await StockTransfer.findOne(query);
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

    const newTransfer = await StockTransfer.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });

    // Apply new transfer
    if (newTransfer && newTransfer.items && newTransfer.items.length > 0) {
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
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company, isSuperAdmin);
    const oldTransfer = await StockTransfer.findOne(query);
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

    await StockTransfer.findOneAndDelete(query);
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

    const imported = await StockTransfer.insertMany(transfersWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
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
