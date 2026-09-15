const express = require('express');
const router = express.Router();
const { 
  createContra, 
  getContras, 
  getContraById, 
  updateContra, 
  deleteContra 
} = require('../controllers/contraController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createContra)
  .get(protect, getContras);

router.route('/:id')
  .get(protect, getContraById)
  .put(protect, updateContra)
  .delete(protect, deleteContra);

module.exports = router;
