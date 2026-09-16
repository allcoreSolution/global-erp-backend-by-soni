const Bank = require('../models/Bank');

// @desc    Get all banks
// @route   GET /api/banks
// @access  Private
const getBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({ company: req.user.company });
    res.json(banks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanks
};
