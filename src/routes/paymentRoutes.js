const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getPayments, 
  getPaymentById, 
  updatePayment, 
  deletePayment 
} = require('../controllers/paymentController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createPayment)
  .get(protect, getPayments);

router.route('/:id')
  .get(protect, getPaymentById)
  .put(protect, updatePayment)
  .delete(protect, deletePayment);

module.exports = router;
