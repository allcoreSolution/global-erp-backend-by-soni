const { CreditNote } = require('../models/CreditNote');

// @desc    Create a new Credit Note
// @route   POST /api/credit-notes
// @access  Private
const createCreditNote = async (req, res, next) => {
  try {
    const newCreditNote = await CreditNote.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newCreditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Credit Notes
// @route   GET /api/credit-notes
// @access  Private
const getCreditNotes = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const creditNotes = await CreditNote.find(query);
    res.json({ success: true, data: creditNotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Credit Note by ID
// @route   GET /api/credit-notes/:id
// @access  Private
const getCreditNoteById = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id);
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Credit Note
// @route   PUT /api/credit-notes/:id
// @access  Private
const updateCreditNote = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Credit Note
// @route   DELETE /api/credit-notes/:id
// @access  Private
const deleteCreditNote = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findByIdAndDelete(req.params.id);
    if (!creditNote) {
      res.status(404);
      return next(new Error('Credit Note not found'));
    }
    res.json({ success: true, message: 'Credit Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Credit Notes
// @route   POST /api/credit-notes/import
// @access  Private
const importCreditNotes = async (req, res, next) => {
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
    const imported = await CreditNote.insertMany(notesWithCompany, { ordered: false });
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
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  updateCreditNote,
  deleteCreditNote,
  importCreditNotes
};
