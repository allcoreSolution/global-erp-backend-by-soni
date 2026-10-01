const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createExpenseCategory, getExpenseCategories } = require('../controllers/expenseCategoryController');

router.route('/')
  .post(protect, createExpenseCategory)
  .get(protect, getExpenseCategories);

module.exports = router;
