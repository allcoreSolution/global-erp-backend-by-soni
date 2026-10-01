const express = require('express');
const router = express.Router();
const profitcenterController = require('../controllers/profitcenterController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(profitcenterController.getAllProfitCenters)
  .post(profitcenterController.createProfitCenter);

router.route('/:id')
  .put(profitcenterController.updateProfitCenter)
  .delete(profitcenterController.deleteProfitCenter);

module.exports = router;
