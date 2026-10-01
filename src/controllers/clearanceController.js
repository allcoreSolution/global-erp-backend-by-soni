const { Clearance } = require('../models/Clearance');

const createClearance = async (req, res, next) => {
  try {
    let clearanceId = req.body.clearanceId;
    if (!clearanceId) {
      clearanceId = `BRCT-${Date.now().toString().slice(-6)}`;
    }
    
    const clearance = await Clearance.create({
      ...req.body,
      clearanceId
    });
    res.status(201).json({ success: true, data: clearance });
  } catch (error) {
    next(error);
  }
};

const getClearances = async (req, res, next) => {
  try {
    const clearances = await Clearance.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: clearances });
  } catch (error) {
    next(error);
  }
};

const getClearanceById = async (req, res, next) => {
  try {
    const clearance = await Clearance.findById(req.params.id);
    if (!clearance) {
      res.status(404);
      return next(new Error('Clearance record not found'));
    }
    res.json({ success: true, data: clearance });
  } catch (error) {
    next(error);
  }
};

const updateClearance = async (req, res, next) => {
  try {
    const clearance = await Clearance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!clearance) {
      res.status(404);
      return next(new Error('Clearance record not found'));
    }
    res.json({ success: true, data: clearance });
  } catch (error) {
    next(error);
  }
};

const patchClearance = async (req, res, next) => {
  try {
    const clearance = await Clearance.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!clearance) {
      res.status(404);
      return next(new Error('Clearance record not found'));
    }
    res.json({ success: true, data: clearance });
  } catch (error) {
    next(error);
  }
};

const deleteClearance = async (req, res, next) => {
  try {
    const clearance = await Clearance.findByIdAndDelete(req.params.id);
    if (!clearance) {
      res.status(404);
      return next(new Error('Clearance record not found'));
    }
    res.json({ success: true, message: 'Clearance record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClearance,
  getClearances,
  getClearanceById,
  updateClearance,
  patchClearance,
  deleteClearance
};
