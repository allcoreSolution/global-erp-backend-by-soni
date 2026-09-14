const ExpenseClaim = require('../models/ExpenseClaim');

const claimExpense = async (req, res, next) => {
  const { claimDate, category, amount, description, employee } = req.body;
  try {
    const claim = await ExpenseClaim.create({
      employee: employee || req.user._id,
      claimDate,
      category,
      amount,
      description
    });
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

const getExpenseClaims = async (req, res, next) => {
  try {
    const claims = await ExpenseClaim.find({ company: req.user?.companyId }).populate('employee', 'username email fullName');
    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

const getExpenseClaimById = async (req, res, next) => {
  try {
    const claim = await ExpenseClaim.findById(req.params.id).populate('employee', 'username email fullName');
    if (!claim) {
      res.status(404);
      return next(new Error('Expense claim not found'));
    }
    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

const updateExpenseClaim = async (req, res, next) => {
  try {
    const claim = await ExpenseClaim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!claim) {
      res.status(404);
      return next(new Error('Expense claim not found'));
    }
    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

const deleteExpenseClaim = async (req, res, next) => {
  try {
    const claim = await ExpenseClaim.findByIdAndDelete(req.params.id);
    if (!claim) {
      res.status(404);
      return next(new Error('Expense claim not found'));
    }
    res.json({ success: true, message: 'Expense claim deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  claimExpense,
  getExpenseClaims,
  getExpenseClaimById,
  updateExpenseClaim,
  deleteExpenseClaim
};
