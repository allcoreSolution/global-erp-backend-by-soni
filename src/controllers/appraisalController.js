const { Appraisal } = require('../models/Appraisal');

// @desc    Create a new Appraisal
// @route   POST /api/appraisals
// @access  Private
const createAppraisal = async (req, res, next) => {
  try {
    const newAppraisal = await Appraisal.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newAppraisal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Appraisals
// @route   GET /api/appraisals
// @access  Private
const getAppraisals = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const appraisals = await Appraisal.find(query);
    res.json({ success: true, data: appraisals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Appraisal by ID
// @route   GET /api/appraisals/:id
// @access  Private
const getAppraisalById = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id);
    if (!appraisal) {
      res.status(404);
      return next(new Error('Appraisal not found'));
    }
    res.json({ success: true, data: appraisal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Appraisal
// @route   PUT /api/appraisals/:id
// @access  Private
const updateAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!appraisal) {
      res.status(404);
      return next(new Error('Appraisal not found'));
    }
    res.json({ success: true, data: appraisal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Appraisal
// @route   DELETE /api/appraisals/:id
// @access  Private
const deleteAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findByIdAndDelete(req.params.id);
    if (!appraisal) {
      res.status(404);
      return next(new Error('Appraisal not found'));
    }
    res.json({ success: true, message: 'Appraisal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppraisal,
  getAppraisals,
  getAppraisalById,
  updateAppraisal,
  deleteAppraisal
};
