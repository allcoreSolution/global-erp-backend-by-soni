const express = require('express');
const router = express.Router();
const salestatusController = require('../controllers/salestatusController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(salestatusController.getAllSaleStatuss)
  .post(salestatusController.createSaleStatus);

router.route('/:id')
  .put(salestatusController.updateSaleStatus)
  .delete(salestatusController.deleteSaleStatus);

module.exports = router;
