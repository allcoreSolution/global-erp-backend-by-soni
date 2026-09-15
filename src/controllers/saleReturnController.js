const { SaleReturn } = require('../models/SaleReturn');

// @desc    Create a new Sale Return
// @route   POST /api/sale-returns
// @access  Private
const createSaleReturn = async (req, res, next) => {
  try {
    const newSaleReturn = await SaleReturn.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newSaleReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Sale Returns
// @route   GET /api/sale-returns
// @access  Private
const getSaleReturns = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const saleReturns = await SaleReturn.find(query);
    res.json({ success: true, data: saleReturns });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sale Return by ID
// @route   GET /api/sale-returns/:id
// @access  Private
const getSaleReturnById = async (req, res, next) => {
  try {
    const saleReturn = await SaleReturn.findById(req.params.id);
    if (!saleReturn) {
      res.status(404);
      return next(new Error('Sale Return not found'));
    }
    res.json({ success: true, data: saleReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Sale Return
// @route   PUT /api/sale-returns/:id
// @access  Private
const updateSaleReturn = async (req, res, next) => {
  try {
    const saleReturn = await SaleReturn.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!saleReturn) {
      res.status(404);
      return next(new Error('Sale Return not found'));
    }
    res.json({ success: true, data: saleReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Sale Return
// @route   DELETE /api/sale-returns/:id
// @access  Private
const deleteSaleReturn = async (req, res, next) => {
  try {
    const saleReturn = await SaleReturn.findByIdAndDelete(req.params.id);
    if (!saleReturn) {
      res.status(404);
      return next(new Error('Sale Return not found'));
    }
    res.json({ success: true, message: 'Sale Return deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSaleReturn,
  getSaleReturns,
  getSaleReturnById,
  updateSaleReturn,
  deleteSaleReturn
};
