const express = require('express');
const router = express.Router();
const {
  claimExpense,
  getExpenseClaims,
  getExpenseClaimById,
  updateExpenseClaim,
  deleteExpenseClaim
} = require('../controllers/expenseClaimController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('create_expenses'), claimExpense);
router.get('/', protect, checkPermission('view_expenses'), getExpenseClaims);
router.get('/:id', protect, checkPermission('view_expenses'), getExpenseClaimById);
router.put('/:id', protect, checkPermission('edit_expenses'), updateExpenseClaim);
router.delete('/:id', protect, checkPermission('delete_expenses'), deleteExpenseClaim);

module.exports = router;
