const express = require('express');
const router = express.Router();
const paymentstatusController = require('../controllers/paymentstatusController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(paymentstatusController.getAllPaymentStatuss)
  .post(paymentstatusController.createPaymentStatus);

router.route('/:id')
  .put(paymentstatusController.updatePaymentStatus)
  .delete(paymentstatusController.deletePaymentStatus);

module.exports = router;
