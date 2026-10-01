const express = require('express');
const router = express.Router();
const costcenterController = require('../controllers/costcenterController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(costcenterController.getAllCostCenters)
  .post(costcenterController.createCostCenter);

router.route('/:id')
  .put(costcenterController.updateCostCenter)
  .delete(costcenterController.deleteCostCenter);

module.exports = router;
