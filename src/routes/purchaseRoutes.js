const express = require('express');
const router = express.Router();
const { addPurchase, getPurchases, updatePurchase, deletePurchase } = require('../controllers/purchaseController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Purchases
router.get('/', protect, getPurchases);
router.post('/', protect, checkPermission('create_purchases'), addPurchase);
router.put('/:id', protect, checkPermission('create_purchases'), updatePurchase);
router.delete('/:id', protect, checkPermission('create_purchases'), deletePurchase);

module.exports = router;
