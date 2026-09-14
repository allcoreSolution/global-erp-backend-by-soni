const { TaxSlab } = require('../models/TaxSlab');

const createTaxSlab = async (req, res, next) => {
  try {
    let taxCode = req.body.taxCode;
    if (!taxCode) {
      taxCode = `TX-${Date.now().toString().slice(-4)}`;
    }

    const gstRate = Number(req.body.gstRate || 0);
    const cgst = req.body.cgst !== undefined ? Number(req.body.cgst) : gstRate / 2;
    const sgst = req.body.sgst !== undefined ? Number(req.body.sgst) : gstRate / 2;
    const igst = req.body.igst !== undefined ? Number(req.body.igst) : gstRate;
    
    const taxSlab = await TaxSlab.create({
      ...req.body,
      taxCode,
      gstRate,
      cgst,
      sgst,
      igst,
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
    if (req.body.gstRate !== undefined) {
      const gstRate = Number(req.body.gstRate);
      if (req.body.cgst === undefined) req.body.cgst = gstRate / 2;
      if (req.body.sgst === undefined) req.body.sgst = gstRate / 2;
      if (req.body.igst === undefined) req.body.igst = gstRate;
    }

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
