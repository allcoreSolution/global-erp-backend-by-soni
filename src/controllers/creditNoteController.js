const { CreditNote } = require('../models/CreditNote');

const createCreditNote = async (req, res, next) => {
  try {
    let noteNo = req.body.noteNo;
    if (!noteNo) {
      noteNo = `CN-${Date.now().toString().slice(-6)}`;
    }
    
    const note = await CreditNote.create({
      ...req.body,
      noteNo
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const getCreditNotes = async (req, res, next) => {
  try {
    const notes = await CreditNote.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

const getCreditNoteById = async (req, res, next) => {
  try {
    const note = await CreditNote.findById(req.params.id);
    if (!note) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const updateCreditNote = async (req, res, next) => {
  try {
    const note = await CreditNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!note) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const patchCreditNote = async (req, res, next) => {
  try {
    const note = await CreditNote.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!note) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const deleteCreditNote = async (req, res, next) => {
  try {
    const note = await CreditNote.findByIdAndDelete(req.params.id);
    if (!note) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, message: 'Credit Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  updateCreditNote,
  patchCreditNote,
  deleteCreditNote
};
