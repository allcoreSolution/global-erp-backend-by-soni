const express = require('express');
const router = express.Router();
const { 
  createPackingSlip, 
  getPackingSlips, 
  getPackingSlipById, 
  updatePackingSlip, 
  deletePackingSlip,
  importPackingSlips
} = require('../controllers/packingSlipController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/import').post(protect, importPackingSlips);

router.route('/')
  .post(protect, createPackingSlip)
  .get(protect, getPackingSlips);

router.route('/:id')
  .get(protect, getPackingSlipById)
  .put(protect, updatePackingSlip)
  .delete(protect, deletePackingSlip);

module.exports = router;
