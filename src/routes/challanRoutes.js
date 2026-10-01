const express = require('express');
const router = express.Router();
const { 
  createChallan, 
  getChallans, 
  getChallanById, 
  updateChallan, 
  deleteChallan 
} = require('../controllers/challanController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createChallan)
  .get(protect, getChallans);

router.route('/:id')
  .get(protect, getChallanById)
  .put(protect, updateChallan)
  .delete(protect, deleteChallan);

module.exports = router;
