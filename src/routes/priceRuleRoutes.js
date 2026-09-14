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

router.get('/', protect, getPriceRules);
router.get('/:id', protect, getPriceRuleById);
router.post('/', protect, checkPermission('manage_products'), createPriceRule);
router.put('/:id', protect, checkPermission('manage_products'), updatePriceRule);
router.patch('/:id', protect, checkPermission('manage_products'), patchPriceRule);
router.delete('/:id', protect, checkPermission('manage_products'), deletePriceRule);

module.exports = router;
