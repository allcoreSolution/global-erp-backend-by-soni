const Holiday = require('../models/Holiday');

const addHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find({ company: req.user?.companyId }).sort({ holidayDate: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

const getHolidayById = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      res.status(404);
      return next(new Error('Holiday not found'));
    }
    res.json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!holiday) {
      res.status(404);
      return next(new Error('Holiday not found'));
    }
    res.json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      res.status(404);
      return next(new Error('Holiday not found'));
    }
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday
};
