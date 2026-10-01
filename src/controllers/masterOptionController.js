const { MasterOption } = require('../models/MasterOption');

// @desc    Get Master Options by Category
// @route   GET /api/master-options?category=XYZ
// @access  Private
const getMasterOptions = async (req, res, next) => {
  try {
    const { category } = req.query;
    if (!category) {
      res.status(400);
      return next(new Error('Category is required'));
    }

    const query = { category };
    if (req.user?.companyId) {
      query.company = req.user.companyId;
    }

    const options = await MasterOption.find(query);
    res.json({ success: true, data: options });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Master Option
// @route   POST /api/master-options
// @access  Private
const createMasterOption = async (req, res, next) => {
  try {
    const { category, label, value } = req.body;
    if (!category || !label || !value) {
      res.status(400);
      return next(new Error('Category, label, and value are required'));
    }

    const newOption = await MasterOption.create({
      category,
      label,
      value,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newOption });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMasterOptions,
  createMasterOption
};
