const SalaryStructure = require('../models/SalaryStructure');

const addSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: salaryStructure });
  } catch (error) {
    next(error);
  }
};

const getSalaryStructures = async (req, res, next) => {
  try {
    const salaryStructures = await SalaryStructure.find({ company: req.user?.companyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: salaryStructures });
  } catch (error) {
    next(error);
  }
};

const getSalaryStructureById = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.findById(req.params.id);
    if (!salaryStructure) {
      res.status(404);
      return next(new Error('Salary Structure not found'));
    }
    res.json({ success: true, data: salaryStructure });
  } catch (error) {
    next(error);
  }
};

const updateSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!salaryStructure) {
      res.status(404);
      return next(new Error('Salary Structure not found'));
    }
    res.json({ success: true, data: salaryStructure });
  } catch (error) {
    next(error);
  }
};

const deleteSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndDelete(req.params.id);
    if (!salaryStructure) {
      res.status(404);
      return next(new Error('Salary Structure not found'));
    }
    res.json({ success: true, message: 'Salary Structure deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSalaryStructure,
  getSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure
};
