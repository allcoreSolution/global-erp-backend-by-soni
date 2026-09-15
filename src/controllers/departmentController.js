const { Department } = require('../models/Department');

// @desc    Create a new Department
// @route   POST /api/departments
// @access  Private
const createDepartment = async (req, res, next) => {
  try {
    const newDepartment = await Department.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newDepartment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const departments = await Department.find(query);
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404);
      return next(new Error('Department not found'));
    }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Department
// @route   PUT /api/departments/:id
// @access  Private
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

// @desc    Delete Department
// @route   DELETE /api/departments/:id
// @access  Private
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
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
