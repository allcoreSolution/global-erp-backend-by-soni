const { ShiftSetup } = require('../models/ShiftSetup');

// @desc    Create a new Shift Setup
// @route   POST /api/shift-setup
// @access  Private
const createShiftSetup = async (req, res, next) => {
  try {
    const newShiftSetup = await ShiftSetup.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newShiftSetup });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Shift Setups
// @route   GET /api/shift-setup
// @access  Private
const getShiftSetups = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const shiftSetups = await ShiftSetup.find(query);
    res.json({ success: true, data: shiftSetups });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Shift Setup by ID
// @route   GET /api/shift-setup/:id
// @access  Private
const getShiftSetupById = async (req, res, next) => {
  try {
    const shiftSetup = await ShiftSetup.findById(req.params.id);
    if (!shiftSetup) {
      res.status(404);
      return next(new Error('Shift Setup not found'));
    }
    res.json({ success: true, data: shiftSetup });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Shift Setup
// @route   PUT /api/shift-setup/:id
// @access  Private
const updateShiftSetup = async (req, res, next) => {
  try {
    const shiftSetup = await ShiftSetup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!shiftSetup) {
      res.status(404);
      return next(new Error('Shift Setup not found'));
    }
    res.json({ success: true, data: shiftSetup });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Shift Setup
// @route   DELETE /api/shift-setup/:id
// @access  Private
const deleteShiftSetup = async (req, res, next) => {
  try {
    const shiftSetup = await ShiftSetup.findByIdAndDelete(req.params.id);
    if (!shiftSetup) {
      res.status(404);
      return next(new Error('Shift Setup not found'));
    }
    res.json({ success: true, message: 'Shift Setup deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShiftSetup,
  getShiftSetups,
  getShiftSetupById,
  updateShiftSetup,
  deleteShiftSetup
};
