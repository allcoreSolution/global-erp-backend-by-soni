const { DebitNote } = require('../models/DebitNote');

const createDebitNote = async (req, res, next) => {
  try {
    let noteNo = req.body.noteNo;
    if (!noteNo) {
      noteNo = `DN-${Date.now().toString().slice(-6)}`;
    }
    
    const note = await DebitNote.create({
      ...req.body,
      noteNo
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const getDebitNotes = async (req, res, next) => {
  try {
    const notes = await DebitNote.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

const getDebitNoteById = async (req, res, next) => {
  try {
    const note = await DebitNote.findById(req.params.id);
    if (!note) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const updateDebitNote = async (req, res, next) => {
  try {
    const note = await DebitNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!note) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const patchDebitNote = async (req, res, next) => {
  try {
    const note = await DebitNote.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!note) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const deleteDebitNote = async (req, res, next) => {
  try {
    const note = await DebitNote.findByIdAndDelete(req.params.id);
    if (!note) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, message: 'Debit Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDebitNote,
  getDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  patchDebitNote,
  deleteDebitNote
};
