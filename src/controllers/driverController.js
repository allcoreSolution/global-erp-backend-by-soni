const { Driver } = require('../models/Driver');

// @desc    Create a new Driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res, next) => {
  try {
    let driverCode = req.body.driverCode;
    if (!driverCode || driverCode === 'DRV-0001') {
      driverCode = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    const newDriver = await Driver.create({
      ...req.body,
      driverCode,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newDriver });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Drivers
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const drivers = await Driver.find(query);
    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Driver by ID
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Driver
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Driver
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
