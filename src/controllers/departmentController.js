const Department = require('../models/Department');

const addDepartment = async (req, res, next) => {
  try {
    const department = await Department.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ company: req.user?.companyId })
      .populate('deptHead', 'fullName empId')
      .populate('branch', 'branchName code');
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('deptHead', 'fullName empId')
      .populate('branch', 'branchName code');
    if (!department) {
      res.status(404);
      return next(new Error('Department not found'));
    }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!department) {
      res.status(404);
      return next(new Error('Department not found'));
    }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      res.status(404);
      return next(new Error('Department not found'));
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
