const express = require('express');
const router = express.Router();
const { 
  createShiftSetup, 
  getShiftSetups, 
  getShiftSetupById, 
  updateShiftSetup, 
  deleteShiftSetup 
} = require('../controllers/shiftSetupController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_hrms'), createShiftSetup)
  .get(protect, getShiftSetups);

router.route('/:id')
  .get(protect, getShiftSetupById)
  .put(protect, checkPermission('manage_hrms'), updateShiftSetup)
  .delete(protect, checkPermission('manage_hrms'), deleteShiftSetup);

module.exports = router;
