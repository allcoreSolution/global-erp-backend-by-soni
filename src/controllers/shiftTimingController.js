const ShiftTiming = require('../models/ShiftTiming');

const addShiftTiming = async (req, res, next) => {
  try {
    const shift = await ShiftTiming.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const getShiftTimings = async (req, res, next) => {
  try {
    const shifts = await ShiftTiming.find({ company: req.user?.companyId });
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

const getShiftTimingById = async (req, res, next) => {
  try {
    const shift = await ShiftTiming.findById(req.params.id);
    if (!shift) {
      res.status(404);
      return next(new Error('Shift timing not found'));
    }
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const updateShiftTiming = async (req, res, next) => {
  try {
    const shift = await ShiftTiming.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!shift) {
      res.status(404);
      return next(new Error('Shift timing not found'));
    }
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const deleteShiftTiming = async (req, res, next) => {
  try {
    const shift = await ShiftTiming.findByIdAndDelete(req.params.id);
    if (!shift) {
      res.status(404);
      return next(new Error('Shift timing not found'));
    }
    res.json({ success: true, message: 'Shift timing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addShiftTiming,
  getShiftTimings,
  getShiftTimingById,
  updateShiftTiming,
  deleteShiftTiming
};
