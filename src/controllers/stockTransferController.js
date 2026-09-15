const { StockTransfer } = require('../models/StockTransfer');

// @desc    Create a new Stock Transfer
// @route   POST /api/stock-transfers
// @access  Private
const createStockTransfer = async (req, res, next) => {
  try {
    const newStockTransfer = await StockTransfer.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

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
    const stockTransfer = await StockTransfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!stockTransfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, data: stockTransfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Stock Transfer
// @route   DELETE /api/stock-transfers/:id
// @access  Private
const deleteStockTransfer = async (req, res, next) => {
  try {
    const stockTransfer = await StockTransfer.findByIdAndDelete(req.params.id);
    if (!stockTransfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, message: 'Stock Transfer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStockTransfer,
  getStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  deleteStockTransfer
};
