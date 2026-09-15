const express = require('express');
const router = express.Router();
const { 
  createDriver, 
  getDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver 
} = require('../controllers/driverController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createDriver)
  .get(protect, getDrivers);

router.route('/:id')
  .get(protect, getDriverById)
  .put(protect, updateDriver)
  .delete(protect, deleteDriver);

module.exports = router;
