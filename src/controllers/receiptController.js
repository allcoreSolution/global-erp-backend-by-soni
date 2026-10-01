const { Receipt } = require('../models/Receipt');

// @desc    Create a new Receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res, next) => {
  try {
    const newReceipt = await Receipt.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Receipts
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const receipts = await Receipt.find(query);
    res.json({ success: true, data: receipts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      res.status(404);
      return next(new Error('Receipt not found'));
    }
    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt
};
