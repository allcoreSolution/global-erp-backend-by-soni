const PerformanceRating = require('../models/PerformanceRating');

const addPerformanceRating = async (req, res, next) => {
  try {
    const rating = await PerformanceRating.create(req.body);
    res.status(201).json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
};

const getPerformanceRatings = async (req, res, next) => {
  try {
    const ratings = await PerformanceRating.find({ company: req.user?.companyId }).populate('employee', 'username email fullName empId');
    res.json({ success: true, data: ratings });
  } catch (error) {
    next(error);
  }
};

const getPerformanceRatingById = async (req, res, next) => {
  try {
    const rating = await PerformanceRating.findById(req.params.id).populate('employee', 'username email fullName empId');
    if (!rating) {
      res.status(404);
      return next(new Error('Performance rating not found'));
    }
    res.json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
};

const updatePerformanceRating = async (req, res, next) => {
  try {
    const rating = await PerformanceRating.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!rating) {
      res.status(404);
      return next(new Error('Performance rating not found'));
    }
    res.json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
};

const deletePerformanceRating = async (req, res, next) => {
  try {
    const rating = await PerformanceRating.findByIdAndDelete(req.params.id);
    if (!rating) {
      res.status(404);
      return next(new Error('Performance rating not found'));
    }
    res.json({ success: true, message: 'Performance rating deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPerformanceRating,
  getPerformanceRatings,
  getPerformanceRatingById,
  updatePerformanceRating,
  deletePerformanceRating
};
