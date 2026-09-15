const express = require('express');
const router = express.Router();
const { 
  createGiftCard, 
  getGiftCards, 
  getGiftCardById, 
  updateGiftCard, 
  deleteGiftCard 
} = require('../controllers/giftCardController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createGiftCard)
  .get(protect, getGiftCards);

router.route('/:id')
  .get(protect, getGiftCardById)
  .put(protect, updateGiftCard)
  .delete(protect, deleteGiftCard);

module.exports = router;
