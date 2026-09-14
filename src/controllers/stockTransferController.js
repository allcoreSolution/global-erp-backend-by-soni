const { StockTransfer } = require('../models/StockTransfer');

const createStockTransfer = async (req, res, next) => {
  try {
    let transferNo = req.body.transferNo;
    if (!transferNo) {
      transferNo = `ST-${Date.now().toString().slice(-6)}`;
    }
    
    const transfer = await StockTransfer.create({
      ...req.body,
      transferNo
    });
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

const getStockTransfers = async (req, res, next) => {
  try {
    const transfers = await StockTransfer.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: transfers });
  } catch (error) {
    next(error);
  }
};

const getStockTransferById = async (req, res, next) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);
    if (!transfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

const updateStockTransfer = async (req, res, next) => {
  try {
    const transfer = await StockTransfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!transfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

const patchStockTransfer = async (req, res, next) => {
  try {
    const transfer = await StockTransfer.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!transfer) {
      res.status(404);
      return next(new Error('Stock Transfer not found'));
    }
    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

const deleteStockTransfer = async (req, res, next) => {
  try {
    const transfer = await StockTransfer.findByIdAndDelete(req.params.id);
    if (!transfer) {
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
  patchStockTransfer,
  deleteStockTransfer
};
