const { Employee } = require('../models/Employee');

// @desc    Create a new Employee
// @route   POST /api/employees
// @access  Private
const createEmployee = async (req, res, next) => {
  try {
    const employeeData = { ...req.body };
    if (req.file && req.file.path) {
      employeeData.profilePhoto = req.file.path;
    }

    const newEmployee = await Employee.create({
      ...employeeData,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const query = {}; // Temporarily remove company filter for testing
    const employees = await Employee.find(query);
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file && req.file.path) {
      updateData.profilePhoto = req.file.path;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Employees
// @route   POST /api/employees/import
// @access  Private
const importEmployees = async (req, res, next) => {
  try {
    const employees = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const employeesWithCompany = employees.map(emp => ({
      ...emp,
      company: companyId || emp.company
    }));

    const imported = await Employee.insertMany(employeesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(207).json({ success: true, message: 'Imported with some duplicate errors', count: error.insertedDocs?.length || 0 });
    }
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  importEmployees
};
