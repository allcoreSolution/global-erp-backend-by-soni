const { EmployeeTarget } = require('../models/EmployeeTarget');

// @desc    Create a new Employee Target
// @route   POST /api/employee-targets
// @access  Private
const createEmployeeTarget = async (req, res, next) => {
  try {
    const newEmployeeTarget = await EmployeeTarget.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newEmployeeTarget });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Employee Targets
// @route   GET /api/employee-targets
// @access  Private
const getEmployeeTargets = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const employeeTargets = await EmployeeTarget.find(query);
    res.json({ success: true, data: employeeTargets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Target by ID
// @route   GET /api/employee-targets/:id
// @access  Private
const getEmployeeTargetById = async (req, res, next) => {
  try {
    const employeeTarget = await EmployeeTarget.findById(req.params.id);
    if (!employeeTarget) {
      res.status(404);
      return next(new Error('Employee Target not found'));
    }
    res.json({ success: true, data: employeeTarget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employee Target
// @route   PUT /api/employee-targets/:id
// @access  Private
const updateEmployeeTarget = async (req, res, next) => {
  try {
    const employeeTarget = await EmployeeTarget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!employeeTarget) {
      res.status(404);
      return next(new Error('Employee Target not found'));
    }
    res.json({ success: true, data: employeeTarget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Employee Target
// @route   DELETE /api/employee-targets/:id
// @access  Private
const deleteEmployeeTarget = async (req, res, next) => {
  try {
    const employeeTarget = await EmployeeTarget.findByIdAndDelete(req.params.id);
    if (!employeeTarget) {
      res.status(404);
      return next(new Error('Employee Target not found'));
    }
    res.json({ success: true, message: 'Employee Target deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployeeTarget,
  getEmployeeTargets,
  getEmployeeTargetById,
  updateEmployeeTarget,
  deleteEmployeeTarget
};
