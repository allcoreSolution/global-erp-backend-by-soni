const { DebitNote } = require('../models/DebitNote');

// @desc    Create a new Debit Note
// @route   POST /api/debit-notes
// @access  Private
const createDebitNote = async (req, res, next) => {
  try {
    const newDebitNote = await DebitNote.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newDebitNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Debit Notes
// @route   GET /api/debit-notes
// @access  Private
const getDebitNotes = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const debitNotes = await DebitNote.find(query);
    res.json({ success: true, data: debitNotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Debit Note by ID
// @route   GET /api/debit-notes/:id
// @access  Private
const getDebitNoteById = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.findById(req.params.id);
    if (!debitNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: debitNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Debit Note
// @route   PUT /api/debit-notes/:id
// @access  Private
const updateDebitNote = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!debitNote) {
      res.status(404);
      return next(new Error('Debit Note not found'));
    }
    res.json({ success: true, data: debitNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Debit Note
// @route   DELETE /api/debit-notes/:id
// @access  Private
const deleteDebitNote = async (req, res, next) => {
  try {
    const debitNote = await DebitNote.findByIdAndDelete(req.params.id);
    if (!debitNote) {
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
  deleteDebitNote
};
