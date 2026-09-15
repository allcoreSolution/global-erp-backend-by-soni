const { SalaryStructure } = require('../models/SalaryStructure');

// @desc    Create a new Salary Structure
// @route   POST /api/salary-structures
// @access  Private
const createSalaryStructure = async (req, res, next) => {
  try {
    const newSalaryStructure = await SalaryStructure.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newSalaryStructure });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Salary Structures
// @route   GET /api/salary-structures
// @access  Private
const getSalaryStructures = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const salaryStructures = await SalaryStructure.find(query);
    res.json({ success: true, data: salaryStructures });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Salary Structure by ID
// @route   GET /api/salary-structures/:id
// @access  Private
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

// @desc    Update Salary Structure
// @route   PUT /api/salary-structures/:id
// @access  Private
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

// @desc    Delete Salary Structure
// @route   DELETE /api/salary-structures/:id
// @access  Private
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
  createSalaryStructure,
  getSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure
};
