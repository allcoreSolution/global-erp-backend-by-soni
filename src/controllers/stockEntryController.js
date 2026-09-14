const { StockEntry } = require('../models/StockEntry');

const createStockEntry = async (req, res, next) => {
  try {
    let voucherNo = req.body.voucherNo;
    if (!voucherNo) {
      voucherNo = `SE-${Date.now().toString().slice(-6)}`;
    }
    
    const entry = await StockEntry.create({
      ...req.body,
      voucherNo
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const getStockEntries = async (req, res, next) => {
  try {
    const entries = await StockEntry.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

const getStockEntryById = async (req, res, next) => {
  try {
    const entry = await StockEntry.findById(req.params.id);
    if (!entry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const updateStockEntry = async (req, res, next) => {
  try {
    const entry = await StockEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!entry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const patchStockEntry = async (req, res, next) => {
  try {
    const entry = await StockEntry.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!entry) {
      res.status(404);
      return next(new Error('Stock Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const deleteStockEntry = async (req, res, next) => {
  try {
    const entry = await StockEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
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
  patchStockEntry,
  deleteStockEntry
};
