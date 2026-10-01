const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(countryController.getAllCountrys)
  .post(countryController.createCountry);

router.route('/:id')
  .put(countryController.updateCountry)
  .delete(countryController.deleteCountry);

module.exports = router;
