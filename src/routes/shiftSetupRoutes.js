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
  .post(protect, checkPermission('create_shift_setups'), createShiftSetup)
  .get(protect, checkPermission('view_shift_setups'), getShiftSetups);

router.route('/:id')
  .get(protect, checkPermission('view_shift_setups'), getShiftSetupById)
  .put(protect, checkPermission('edit_shift_setups'), updateShiftSetup)
  .delete(protect, checkPermission('delete_shift_setups'), deleteShiftSetup);

module.exports = router;
