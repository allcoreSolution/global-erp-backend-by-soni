const { Employee } = require('../models/Employee');

const createEmployee = async (req, res, next) => {
  try {
    let empId = req.body.empId;
    if (!empId) {
      empId = `EMP-${Date.now().toString().slice(-4)}`;
    }
    
    const employee = await Employee.create({
      ...req.body,
      empId
    });
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

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

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
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

const patchEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  patchEmployee,
  deleteEmployee
};
