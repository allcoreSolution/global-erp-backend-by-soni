const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(cityController.getAllCitys)
  .post(cityController.createCity);

router.route('/:id')
  .put(cityController.updateCity)
  .delete(cityController.deleteCity);

module.exports = router;
