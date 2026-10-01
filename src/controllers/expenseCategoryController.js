const ExpenseCategory = require('../models/ExpenseCategory');

const createExpenseCategory = async (req, res, next) => {
  try {
    const category = await ExpenseCategory.create({
      ...req.body,
      company: req.user?.company || req.body.company || req.user?.companyId
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const getExpenseCategories = async (req, res, next) => {
  try {
    const query = (req.user?.company || req.user?.companyId) ? { company: req.user.company || req.user.companyId } : {};
    const categories = await ExpenseCategory.find(query);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpenseCategory,
  getExpenseCategories
};
