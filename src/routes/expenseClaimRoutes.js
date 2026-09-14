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

router.post('/', protect, checkPermission('manage_hrms'), claimExpense);
router.get('/', protect, checkPermission('manage_hrms'), getExpenseClaims);
router.get('/:id', protect, checkPermission('manage_hrms'), getExpenseClaimById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateExpenseClaim);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteExpenseClaim);

module.exports = router;
