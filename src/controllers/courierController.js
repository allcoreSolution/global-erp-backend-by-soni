const { Courier } = require('../models/Courier');

// @desc    Create a new Courier
// @route   POST /api/couriers
// @access  Private
const createCourier = async (req, res, next) => {
  try {
    const newCourier = await Courier.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newCourier });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Couriers
// @route   GET /api/couriers
// @access  Private
const getCouriers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const couriers = await Courier.find(query);
    res.json({ success: true, data: couriers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Courier by ID
// @route   GET /api/couriers/:id
// @access  Private
const getCourierById = async (req, res, next) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, data: courier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Courier
// @route   PUT /api/couriers/:id
// @access  Private
const updateCourier = async (req, res, next) => {
  try {
    const courier = await Courier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, data: courier });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Courier
// @route   DELETE /api/couriers/:id
// @access  Private
const deleteCourier = async (req, res, next) => {
  try {
    const courier = await Courier.findByIdAndDelete(req.params.id);
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, message: 'Courier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourier,
  getCouriers,
  getCourierById,
  updateCourier,
  deleteCourier
};
