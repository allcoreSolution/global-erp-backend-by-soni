const { TaxSlab } = require('../models/TaxSlab');

const createTaxSlab = async (req, res, next) => {
  try {
    let id = req.body.id;
    if (!id) {
      id = `TAX-${Date.now().toString().slice(-4)}`;
    }
    
    const taxSlab = await TaxSlab.create({
      ...req.body,
      id,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: taxSlab });
  } catch (error) {
    next(error);
  }
};

const getTaxSlabs = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const taxSlabs = await TaxSlab.find(query);
    res.json({ success: true, data: taxSlabs });
  } catch (error) {
    next(error);
  }
};

const getTaxSlabById = async (req, res, next) => {
  try {
    const taxSlab = await TaxSlab.findById(req.params.id);
    if (!taxSlab) {
      res.status(404);
      return next(new Error('Tax Slab not found'));
    }
    res.json({ success: true, data: taxSlab });
  } catch (error) {
    next(error);
  }
};

const updateTaxSlab = async (req, res, next) => {
  try {


    const taxSlab = await TaxSlab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!taxSlab) {
      res.status(404);
      return next(new Error('Tax Slab not found'));
    }
    res.json({ success: true, data: taxSlab });
  } catch (error) {
    next(error);
  }
};

const patchTaxSlab = async (req, res, next) => {
  try {
    const taxSlab = await TaxSlab.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!taxSlab) {
      res.status(404);
      return next(new Error('Tax Slab not found'));
    }
    res.json({ success: true, data: taxSlab });
  } catch (error) {
    next(error);
  }
};

const deleteTaxSlab = async (req, res, next) => {
  try {
    const taxSlab = await TaxSlab.findByIdAndDelete(req.params.id);
    if (!taxSlab) {
      res.status(404);
      return next(new Error('Tax Slab not found'));
    }
    res.json({ success: true, message: 'Tax Slab deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTaxSlab,
  getTaxSlabs,
  getTaxSlabById,
  updateTaxSlab,
  patchTaxSlab,
  deleteTaxSlab
};
