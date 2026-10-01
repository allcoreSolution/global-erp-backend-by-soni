const express = require('express');
const router = express.Router();
const discounttypeController = require('../controllers/discounttypeController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(discounttypeController.getAllDiscountTypes)
  .post(discounttypeController.createDiscountType);

router.route('/:id')
  .put(discounttypeController.updateDiscountType)
  .delete(discounttypeController.deleteDiscountType);

module.exports = router;
