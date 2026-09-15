const { PackingSlip } = require('../models/PackingSlip');

// @desc    Create a new Packing Slip
// @route   POST /api/packing-slips
// @access  Private
const createPackingSlip = async (req, res, next) => {
  try {
    let packingNo = req.body.packingNo;
    if (!packingNo) {
      packingNo = `PS-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    
    const newPackingSlip = await PackingSlip.create({
      ...req.body,
      packingNo,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newPackingSlip });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Packing Slips
// @route   GET /api/packing-slips
// @access  Private
const getPackingSlips = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const packingSlips = await PackingSlip.find(query);
    res.json({ success: true, data: packingSlips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Packing Slip by ID
// @route   GET /api/packing-slips/:id
// @access  Private
const getPackingSlipById = async (req, res, next) => {
  try {
    const packingSlip = await PackingSlip.findById(req.params.id);
    if (!packingSlip) {
      res.status(404);
      return next(new Error('Packing Slip not found'));
    }
    res.json({ success: true, data: packingSlip });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Packing Slip
// @route   PUT /api/packing-slips/:id
// @access  Private
const updatePackingSlip = async (req, res, next) => {
  try {
    const packingSlip = await PackingSlip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!packingSlip) {
      res.status(404);
      return next(new Error('Packing Slip not found'));
    }
    res.json({ success: true, data: packingSlip });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Packing Slip
// @route   DELETE /api/packing-slips/:id
// @access  Private
const deletePackingSlip = async (req, res, next) => {
  try {
    const packingSlip = await PackingSlip.findByIdAndDelete(req.params.id);
    if (!packingSlip) {
      res.status(404);
      return next(new Error('Packing Slip not found'));
    }
    res.json({ success: true, message: 'Packing Slip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPackingSlip,
  getPackingSlips,
  getPackingSlipById,
  updatePackingSlip,
  deletePackingSlip
};
