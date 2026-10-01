const { Designation } = require('../models/Designation');

// @desc    Create a new Designation
// @route   POST /api/designations
// @access  Private
const createDesignation = async (req, res, next) => {
  try {
    const newDesignation = await Designation.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newDesignation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Designations
// @route   GET /api/designations
// @access  Private
const getDesignations = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const designations = await Designation.find(query);
    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Designation by ID
// @route   GET /api/designations/:id
// @access  Private
const getDesignationById = async (req, res, next) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Designation
// @route   PUT /api/designations/:id
// @access  Private
const updateDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Designation
// @route   DELETE /api/designations/:id
// @access  Private
const deleteDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation
};
