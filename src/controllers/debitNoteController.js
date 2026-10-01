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

// @desc    Import Debit Notes
// @route   POST /api/debit-notes/import
// @access  Private
const importDebitNotes = async (req, res, next) => {
  try {
    const notes = req.body;
    if (!Array.isArray(notes) || notes.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const notesWithCompany = notes.map(n => ({
      ...n,
      company: companyId || n.company
    }));

    // Use insertMany, but ignore duplicate key errors for ordered: false
    const imported = await DebitNote.insertMany(notesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
      // Partial success if some failed due to duplicate keys
      return res.status(207).json({ success: true, message: 'Imported with some duplicate errors', count: error.insertedDocs?.length || 0 });
    }
    next(error);
  }
};

module.exports = {
  createDebitNote,
  getDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  deleteDebitNote,
  importDebitNotes
};
