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

router.get('/', protect, checkPermission('view_price_lists'), getPriceLists);
router.get('/:id', protect, checkPermission('view_price_lists'), getPriceListById);
router.post('/', protect, checkPermission('create_price_lists'), createPriceList);
router.put('/:id', protect, checkPermission('edit_price_lists'), updatePriceList);
router.patch('/:id', protect, checkPermission('edit_price_lists'), patchPriceList);
router.delete('/:id', protect, checkPermission('delete_price_lists'), deletePriceList);

module.exports = router;
