const { Contra } = require('../models/Contra');

// @desc    Create a new Contra Entry
// @route   POST /api/contras
// @access  Private
const createContra = async (req, res, next) => {
  try {
    const newContra = await Contra.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newContra });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Contra Entries
// @route   GET /api/contras
// @access  Private
const getContras = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const contras = await Contra.find(query);
    res.json({ success: true, data: contras });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Contra Entry by ID
// @route   GET /api/contras/:id
// @access  Private
const getContraById = async (req, res, next) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, data: contra });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Contra Entry
// @route   PUT /api/contras/:id
// @access  Private
const updateContra = async (req, res, next) => {
  try {
    const contra = await Contra.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contra) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, data: contra });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Contra Entry
// @route   DELETE /api/contras/:id
// @access  Private
const deleteContra = async (req, res, next) => {
  try {
    const contra = await Contra.findByIdAndDelete(req.params.id);
    if (!contra) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, message: 'Contra Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContra,
  getContras,
  getContraById,
  updateContra,
  deleteContra
};
