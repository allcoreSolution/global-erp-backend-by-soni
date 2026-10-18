const express = require('express');
const router = express.Router();
const { 
  createCourier, 
  getCouriers, 
  getCourierById, 
  updateCourier, 
  deleteCourier 
} = require('../controllers/courierController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('create_couriers'), createCourier)
  .get(protect, checkPermission('view_couriers'), getCouriers);

router.route('/:id')
  .get(protect, checkPermission('view_couriers'), getCourierById)
  .put(protect, checkPermission('edit_couriers'), updateCourier)
  .delete(protect, checkPermission('delete_couriers'), deleteCourier);

module.exports = router;
