const { StockCount } = require('../models/StockCount');

const createStockCount = async (req, res, next) => {
  try {
    let stockCountId = req.body.stockCountId;
    if (!stockCountId) {
      stockCountId = `SC-${Date.now().toString().slice(-6)}`;
    }
    
    const stockCount = await StockCount.create({
      ...req.body,
      stockCountId,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const getStockCounts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const stockCounts = await StockCount.find(query);
    res.json({ success: true, data: stockCounts });
  } catch (error) {
    next(error);
  }
};

const getStockCountById = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findById(req.params.id);
    if (!stockCount) {
      res.status(404);
      return next(new Error('Stock Count record not found'));
    }
    res.json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const updateStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!stockCount) {
      res.status(404);
      return next(new Error('Stock Count record not found'));
    }
    res.json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const patchStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!stockCount) {
      res.status(404);
      return next(new Error('Stock Count record not found'));
    }
    res.json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const deleteStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndDelete(req.params.id);
    if (!stockCount) {
      res.status(404);
      return next(new Error('Stock Count record not found'));
    }
    res.json({ success: true, message: 'Stock Count record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStockCount,
  getStockCounts,
  getStockCountById,
  updateStockCount,
  patchStockCount,
  deleteStockCount
};
