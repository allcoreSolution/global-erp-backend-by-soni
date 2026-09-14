const express = require('express');
const router = express.Router();
const {
  createPriceList,
  getPriceLists,
  getPriceListById,
  updatePriceList,
  patchPriceList,
  deletePriceList
} = require('../controllers/priceListController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getPriceLists);
router.get('/:id', protect, getPriceListById);
router.post('/', protect, checkPermission('manage_products'), createPriceList);
router.put('/:id', protect, checkPermission('manage_products'), updatePriceList);
router.patch('/:id', protect, checkPermission('manage_products'), patchPriceList);
router.delete('/:id', protect, checkPermission('manage_products'), deletePriceList);

module.exports = router;
