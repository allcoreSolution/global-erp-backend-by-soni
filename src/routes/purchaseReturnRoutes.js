const express = require('express');
const router = express.Router();
const { 
  createPurchaseReturn, 
  getPurchaseReturns, 
  getPurchaseReturnById, 
  updatePurchaseReturn, 
  deletePurchaseReturn 
} = require('../controllers/purchaseReturnController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('create_purchase_returns'), createPurchaseReturn)
  .get(protect, getPurchaseReturns);

router.route('/:id')
  .get(protect, getPurchaseReturnById)
  .put(protect, checkPermission('create_purchase_returns'), updatePurchaseReturn)
  .delete(protect, checkPermission('create_purchase_returns'), deletePurchaseReturn);

module.exports = router;
