const express = require('express');
const router = express.Router();
const { 
  addPurchase, 
  getPurchases, 
  getPurchaseById,
  updatePurchase, 
  deletePurchase,
  importPurchase
} = require('../controllers/purchaseController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/import')
  .post(protect, checkPermission('create_purchases'), importPurchase);

router.route('/')
  .post(protect, checkPermission('create_purchases'), addPurchase)
  .get(protect, checkPermission('view_purchases'), getPurchases);

router.route('/:id')
  .get(protect, checkPermission('view_purchases'), getPurchaseById)
  .put(protect, checkPermission('edit_purchases'), updatePurchase)
  .delete(protect, checkPermission('delete_purchases'), deletePurchase);

module.exports = router;
