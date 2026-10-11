const express = require('express');
const router = express.Router();
const {
  createPriceRule,
  getPriceRules,
  getPriceRuleById,
  updatePriceRule,
  patchPriceRule,
  deletePriceRule
} = require('../controllers/priceRuleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('view_price_rules'), getPriceRules);
router.get('/:id', protect, checkPermission('view_price_rules'), getPriceRuleById);
router.post('/', protect, checkPermission('create_price_rules'), createPriceRule);
router.put('/:id', protect, checkPermission('edit_price_rules'), updatePriceRule);
router.patch('/:id', protect, checkPermission('edit_price_rules'), patchPriceRule);
router.delete('/:id', protect, checkPermission('delete_price_rules'), deletePriceRule);

module.exports = router;
