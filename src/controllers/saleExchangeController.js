const { SaleExchange } = require('../models/SaleExchange');

// @desc    Create a new Sale Exchange
// @route   POST /api/sale-exchanges
// @access  Private
const createSaleExchange = async (req, res, next) => {
  try {
    const newSaleExchange = await SaleExchange.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newSaleExchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Sale Exchanges
// @route   GET /api/sale-exchanges
// @access  Private
const getSaleExchanges = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const saleExchanges = await SaleExchange.find(query);
    res.json({ success: true, data: saleExchanges });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sale Exchange by ID
// @route   GET /api/sale-exchanges/:id
// @access  Private
const getSaleExchangeById = async (req, res, next) => {
  try {
    const saleExchange = await SaleExchange.findById(req.params.id);
    if (!saleExchange) {
      res.status(404);
      return next(new Error('Sale Exchange not found'));
    }
    res.json({ success: true, data: saleExchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Sale Exchange
// @route   PUT /api/sale-exchanges/:id
// @access  Private
const updateSaleExchange = async (req, res, next) => {
  try {
    const saleExchange = await SaleExchange.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!saleExchange) {
      res.status(404);
      return next(new Error('Sale Exchange not found'));
    }
    res.json({ success: true, data: saleExchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Sale Exchange
// @route   DELETE /api/sale-exchanges/:id
// @access  Private
const deleteSaleExchange = async (req, res, next) => {
  try {
    const saleExchange = await SaleExchange.findByIdAndDelete(req.params.id);
    if (!saleExchange) {
      res.status(404);
      return next(new Error('Sale Exchange not found'));
    }
    res.json({ success: true, message: 'Sale Exchange deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSaleExchange,
  getSaleExchanges,
  getSaleExchangeById,
  updateSaleExchange,
  deleteSaleExchange
};
