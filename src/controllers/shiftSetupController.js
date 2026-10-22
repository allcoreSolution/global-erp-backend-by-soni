const ShiftSetup = require('../models/ShiftSetup');

// @desc    Create a new Shift Setup
// @route   POST /api/shift-setups
// @access  Private
const createShiftSetup = async (req, res, next) => {
  try {
    if (!req.body.shiftName || !req.body.shiftName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shift Name is required. Please provide a valid shift name.'
      });
    }

    const companyId = req.user?.companyId || req.user?.company || req.body.company || '';

    // Auto-generate or deduplicate shiftCode
    let shiftCode = req.body.shiftCode || `SHT-${Math.floor(Math.random() * 9000) + 1000}`;
    const existing = await ShiftSetup.findOne({
      shiftCode,
      ...(companyId ? { company: companyId } : {})
    });
    if (existing) {
      shiftCode = `SHT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900) + 100}`;
    }

    const newShiftSetup = await ShiftSetup.create({
      ...req.body,
      shiftCode,
      shiftName: req.body.shiftName.trim(),
      company: companyId
    });

    res.status(201).json({ success: true, data: newShiftSetup });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Shift with this code already exists. Please choose a different code.'
      });
    }
    next(error);
  }
};

// @desc    Get all Shift Setups
// @route   GET /api/shift-setups
// @access  Private
const getShiftSetups = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const query = companyId ? { company: companyId } : {};
    const shiftSetups = await ShiftSetup.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: shiftSetups });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Shift Setup by ID
// @route   GET /api/shift-setups/:id
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
// @route   PUT /api/shift-setups/:id
// @access  Private
const updateShiftSetup = async (req, res, next) => {
  try {
    if (req.body.shiftName !== undefined && (!req.body.shiftName || !req.body.shiftName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Shift Name cannot be empty.'
      });
    }

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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete Shift Setup
// @route   DELETE /api/shift-setups/:id
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
