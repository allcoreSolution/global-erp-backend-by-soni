const { Unit } = require('../models/Unit');

const createUnit = async (req, res, next) => {
  try {
    const unit = await Unit.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const getUnits = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const units = await Unit.find(query);
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
};

const getUnitById = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const patchUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  patchUnit,
  deleteUnit
};
