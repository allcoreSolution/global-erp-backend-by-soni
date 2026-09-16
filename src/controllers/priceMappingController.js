const PriceMapping = require('../models/PriceMapping');

// @desc    Get all price mappings for the company
// @route   GET /api/price-mappings
// @access  Private
const getPriceMappings = async (req, res, next) => {
  try {
    const mappings = await PriceMapping.find({ company: req.user.company });
    res.json(mappings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPriceMappings
};
