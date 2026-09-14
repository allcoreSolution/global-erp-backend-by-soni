const { HsnMapping } = require('../models/HsnMapping');

const createHsnMapping = async (req, res, next) => {
  try {
    let mappingId = req.body.mappingId;
    if (!mappingId) {
      mappingId = `TM-${Date.now().toString().slice(-4)}`;
    }
    
    const hsnMapping = await HsnMapping.create({
      ...req.body,
      mappingId,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: hsnMapping });
  } catch (error) {
    next(error);
  }
};

const getHsnMappings = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const hsnMappings = await HsnMapping.find(query);
    res.json({ success: true, data: hsnMappings });
  } catch (error) {
    next(error);
  }
};

const getHsnMappingById = async (req, res, next) => {
  try {
    const hsnMapping = await HsnMapping.findById(req.params.id);
    if (!hsnMapping) {
      res.status(404);
      return next(new Error('HSN Mapping record not found'));
    }
    res.json({ success: true, data: hsnMapping });
  } catch (error) {
    next(error);
  }
};

const updateHsnMapping = async (req, res, next) => {
  try {
    const hsnMapping = await HsnMapping.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hsnMapping) {
      res.status(404);
      return next(new Error('HSN Mapping record not found'));
    }
    res.json({ success: true, data: hsnMapping });
  } catch (error) {
    next(error);
  }
};

const patchHsnMapping = async (req, res, next) => {
  try {
    const hsnMapping = await HsnMapping.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!hsnMapping) {
      res.status(404);
      return next(new Error('HSN Mapping record not found'));
    }
    res.json({ success: true, data: hsnMapping });
  } catch (error) {
    next(error);
  }
};

const deleteHsnMapping = async (req, res, next) => {
  try {
    const hsnMapping = await HsnMapping.findByIdAndDelete(req.params.id);
    if (!hsnMapping) {
      res.status(404);
      return next(new Error('HSN Mapping record not found'));
    }
    res.json({ success: true, message: 'HSN Mapping record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHsnMapping,
  getHsnMappings,
  getHsnMappingById,
  updateHsnMapping,
  patchHsnMapping,
  deleteHsnMapping
};
