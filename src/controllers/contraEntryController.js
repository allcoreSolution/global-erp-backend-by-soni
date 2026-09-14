const { ContraEntry } = require('../models/ContraEntry');

const createContraEntry = async (req, res, next) => {
  try {
    let voucherNumber = req.body.voucherNumber;
    if (!voucherNumber) {
      voucherNumber = `CNTR-${Date.now().toString().slice(-6)}`;
    }
    
    const entry = await ContraEntry.create({
      ...req.body,
      voucherNumber
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const getContraEntries = async (req, res, next) => {
  try {
    const entries = await ContraEntry.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

const getContraEntryById = async (req, res, next) => {
  try {
    const entry = await ContraEntry.findById(req.params.id);
    if (!entry) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const updateContraEntry = async (req, res, next) => {
  try {
    const entry = await ContraEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!entry) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const patchContraEntry = async (req, res, next) => {
  try {
    const entry = await ContraEntry.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!entry) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const deleteContraEntry = async (req, res, next) => {
  try {
    const entry = await ContraEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      res.status(404);
      return next(new Error('Contra Entry not found'));
    }
    res.json({ success: true, message: 'Contra Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContraEntry,
  getContraEntries,
  getContraEntryById,
  updateContraEntry,
  patchContraEntry,
  deleteContraEntry
};
