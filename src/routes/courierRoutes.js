const express = require('express');
const router = express.Router();
const { 
  createCourier, 
  getCouriers, 
  getCourierById, 
  updateCourier, 
  deleteCourier 
} = require('../controllers/courierController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createCourier)
  .get(protect, getCouriers);

router.route('/:id')
  .get(protect, getCourierById)
  .put(protect, updateCourier)
  .delete(protect, deleteCourier);

module.exports = router;
