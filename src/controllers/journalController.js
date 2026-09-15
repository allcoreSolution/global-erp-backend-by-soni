const { Journal } = require('../models/Journal');

// @desc    Create a new Journal Entry
// @route   POST /api/journals
// @access  Private
const createJournal = async (req, res, next) => {
  try {
    const newJournal = await Journal.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newJournal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Journal Entries
// @route   GET /api/journals
// @access  Private
const getJournals = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const journals = await Journal.find(query);
    res.json({ success: true, data: journals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Journal Entry by ID
// @route   GET /api/journals/:id
// @access  Private
const getJournalById = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      res.status(404);
      return next(new Error('Journal Entry not found'));
    }
    res.json({ success: true, data: journal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Journal Entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!journal) {
      res.status(404);
      return next(new Error('Journal Entry not found'));
    }
    res.json({ success: true, data: journal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Journal Entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) {
      res.status(404);
      return next(new Error('Journal Entry not found'));
    }
    res.json({ success: true, message: 'Journal Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal
};
