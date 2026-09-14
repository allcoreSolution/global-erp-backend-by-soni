const { Supplier } = require('../models/Supplier');

const createSupplier = async (req, res, next) => {
  try {
    let supplierCode = req.body.supplierCode;
    if (!supplierCode) {
      supplierCode = `SUP-${Date.now().toString().slice(-4)}`;
    }
    
    // Support legacy field name 'name' if supplierName is missing
    const supplierName = req.body.supplierName || req.body.name;
    
    const supplier = await Supplier.create({
      ...req.body,
      supplierCode,
      supplierName,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const getSuppliers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const suppliers = await Supplier.find(query);
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const patchSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  patchSupplier,
  deleteSupplier
};
