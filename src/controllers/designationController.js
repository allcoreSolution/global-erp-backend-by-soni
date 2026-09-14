const Designation = require('../models/Designation');

const addDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const getDesignations = async (req, res, next) => {
  try {
    const designations = await Designation.find({ company: req.user?.companyId })
      .populate('department', 'departmentName deptCode')
      .populate('reportingManager', 'fullName empId');
    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
};

const getDesignationById = async (req, res, next) => {
  try {
    const designation = await Designation.findById(req.params.id)
      .populate('department', 'departmentName deptCode')
      .populate('reportingManager', 'fullName empId');
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const updateDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const deleteDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      res.status(404);
      return next(new Error('Designation not found'));
    }
    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation
};
