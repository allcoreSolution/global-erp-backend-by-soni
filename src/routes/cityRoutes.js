const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(checkPermission('view_cities'), cityController.getAllCitys)
  .post(checkPermission('create_cities'), cityController.createCity);

router.route('/:id')
  .put(checkPermission('edit_cities'), cityController.updateCity)
  .delete(checkPermission('delete_cities'), cityController.deleteCity);

module.exports = router;
