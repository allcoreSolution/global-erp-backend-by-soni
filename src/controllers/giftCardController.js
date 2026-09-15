const { GiftCard } = require('../models/GiftCard');

// @desc    Create a new Gift Card
// @route   POST /api/gift-cards
// @access  Private
const createGiftCard = async (req, res, next) => {
  try {
    const newGiftCard = await GiftCard.create({
      ...req.body,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newGiftCard });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Gift Cards
// @route   GET /api/gift-cards
// @access  Private
const getGiftCards = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const giftCards = await GiftCard.find(query);
    res.json({ success: true, data: giftCards });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Gift Card by ID
// @route   GET /api/gift-cards/:id
// @access  Private
const getGiftCardById = async (req, res, next) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    if (!giftCard) {
      res.status(404);
      return next(new Error('Gift Card not found'));
    }
    res.json({ success: true, data: giftCard });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Gift Card
// @route   PUT /api/gift-cards/:id
// @access  Private
const updateGiftCard = async (req, res, next) => {
  try {
    const giftCard = await GiftCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!giftCard) {
      res.status(404);
      return next(new Error('Gift Card not found'));
    }
    res.json({ success: true, data: giftCard });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Gift Card
// @route   DELETE /api/gift-cards/:id
// @access  Private
const deleteGiftCard = async (req, res, next) => {
  try {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    if (!giftCard) {
      res.status(404);
      return next(new Error('Gift Card not found'));
    }
    res.json({ success: true, message: 'Gift Card deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGiftCard,
  getGiftCards,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard
};
