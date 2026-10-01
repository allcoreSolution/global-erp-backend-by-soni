const { PurchaseReturn } = require('../models/PurchaseReturn');

// @desc    Create a new Purchase Return
// @route   POST /api/purchase-returns
// @access  Private
const createPurchaseReturn = async (req, res, next) => {
  try {
    const newPurchaseReturn = await PurchaseReturn.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newPurchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Purchase Returns
// @route   GET /api/purchase-returns
// @access  Private
const getPurchaseReturns = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const purchaseReturns = await PurchaseReturn.find(query);
    res.json({ success: true, data: purchaseReturns });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Purchase Return by ID
// @route   GET /api/purchase-returns/:id
// @access  Private
const getPurchaseReturnById = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id);
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }
    res.json({ success: true, data: purchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Purchase Return
// @route   PUT /api/purchase-returns/:id
// @access  Private
const updatePurchaseReturn = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }
    res.json({ success: true, data: purchaseReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Purchase Return
// @route   DELETE /api/purchase-returns/:id
// @access  Private
const deletePurchaseReturn = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturn.findByIdAndDelete(req.params.id);
    if (!purchaseReturn) {
      res.status(404);
      return next(new Error('Purchase Return not found'));
    }
    res.json({ success: true, message: 'Purchase Return deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseReturn,
  getPurchaseReturns,
  getPurchaseReturnById,
  updatePurchaseReturn,
  deletePurchaseReturn
};
