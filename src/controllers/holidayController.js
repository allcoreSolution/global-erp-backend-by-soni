const Holiday = require('../models/Holiday');

const calculateDuration = (start, end) => {
  if (!start) return 1;
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

const addHoliday = async (req, res, next) => {
  try {
    const data = { ...req.body, company: req.user?.companyId };
    if (!data.startDate && data.holidayDate) data.startDate = data.holidayDate;
    if (!data.endDate) data.endDate = data.startDate;
    if (!data.holidayDate) data.holidayDate = data.startDate;
    data.durationDays = calculateDuration(data.startDate, data.endDate);

    const holiday = await Holiday.create(data);
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find({ company: req.user?.companyId }).sort({ startDate: 1, holidayDate: 1 });
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
    const data = { ...req.body };
    if (data.startDate || data.endDate) {
      const s = data.startDate || data.holidayDate;
      const e = data.endDate || s;
      data.startDate = s;
      data.endDate = e;
      data.holidayDate = s;
      data.durationDays = calculateDuration(s, e);
    }
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, data, {
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
