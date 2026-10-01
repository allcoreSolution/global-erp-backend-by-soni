const { StockEntry } = require('../models/StockEntry');

// @desc    Create a new Stock Entry
// @route   POST /api/stock-entries
// @access  Private
const createStockEntry = async (req, res, next) => {
  try {
    const newStockEntry = await StockEntry.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

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
    const stockEntry = await StockEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!stockEntry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
    res.json({ success: true, data: stockEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Stock Entry
// @route   DELETE /api/stock-entries/:id
// @access  Private
const deleteStockEntry = async (req, res, next) => {
  try {
    const stockEntry = await StockEntry.findByIdAndDelete(req.params.id);
    if (!stockEntry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
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
