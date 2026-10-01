const express = require('express');
const router = express.Router();
const { 
  createSale, 
  getSales, 
  updateSale, 
  deleteSale
} = require('../controllers/saleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Sales Routes
router.get('/', protect, getSales);
router.post('/', protect, checkPermission('create_sales'), createSale);
router.put('/:id', protect, checkPermission('create_sales'), updateSale);
router.delete('/:id', protect, checkPermission('create_sales'), deleteSale);


module.exports = router;
