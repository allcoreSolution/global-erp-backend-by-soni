const { Challan } = require('../models/Challan');

// @desc    Create a new Challan
// @route   POST /api/challans
// @access  Private
const createChallan = async (req, res, next) => {
  try {
    let challanNo = req.body.challanNo;
    if (!challanNo) {
      challanNo = `CHL-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    
    const newChallan = await Challan.create({
      ...req.body,
      challanNo,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newChallan });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Challans
// @route   GET /api/challans
// @access  Private
const getChallans = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const challans = await Challan.find(query);
    res.json({ success: true, data: challans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Challan by ID
// @route   GET /api/challans/:id
// @access  Private
const getChallanById = async (req, res, next) => {
  try {
    const challan = await Challan.findById(req.params.id);
    if (!challan) {
      res.status(404);
      return next(new Error('Challan not found'));
    }
    res.json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Challan
// @route   PUT /api/challans/:id
// @access  Private
const updateChallan = async (req, res, next) => {
  try {
    const challan = await Challan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!challan) {
      res.status(404);
      return next(new Error('Challan not found'));
    }
    res.json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Challan
// @route   DELETE /api/challans/:id
// @access  Private
const deleteChallan = async (req, res, next) => {
  try {
    const challan = await Challan.findByIdAndDelete(req.params.id);
    if (!challan) {
      res.status(404);
      return next(new Error('Challan not found'));
    }
    res.json({ success: true, message: 'Challan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  deleteChallan
};
