const EmployeeTarget = require('../models/EmployeeTarget');

const addEmployeeTarget = async (req, res, next) => {
  try {
    const target = await EmployeeTarget.create(req.body);
    res.status(201).json({ success: true, data: target });
  } catch (error) {
    next(error);
  }
};

const getEmployeeTargets = async (req, res, next) => {
  try {
    const targets = await EmployeeTarget.find({ company: req.user?.companyId }).populate('employee', 'username email fullName empId');
    res.json({ success: true, data: targets });
  } catch (error) {
    next(error);
  }
};

const getEmployeeTargetById = async (req, res, next) => {
  try {
    const target = await EmployeeTarget.findById(req.params.id).populate('employee', 'username email fullName empId');
    if (!target) {
      res.status(404);
      return next(new Error('Employee target not found'));
    }
    res.json({ success: true, data: target });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeTarget = async (req, res, next) => {
  try {
    const target = await EmployeeTarget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!target) {
      res.status(404);
      return next(new Error('Employee target not found'));
    }
    res.json({ success: true, data: target });
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeTarget = async (req, res, next) => {
  try {
    const target = await EmployeeTarget.findByIdAndDelete(req.params.id);
    if (!target) {
      res.status(404);
      return next(new Error('Employee target not found'));
    }
    res.json({ success: true, message: 'Employee target deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployeeTarget,
  getEmployeeTargets,
  getEmployeeTargetById,
  updateEmployeeTarget,
  deleteEmployeeTarget
};
