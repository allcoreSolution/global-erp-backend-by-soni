const express = require('express');
const router = express.Router();
const { 
  createDesignation, 
  getDesignations, 
  getDesignationById, 
  updateDesignation, 
  deleteDesignation 
} = require('../controllers/designationController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_hrms'), createDesignation)
  .get(protect, getDesignations);

router.route('/:id')
  .get(protect, getDesignationById)
  .put(protect, checkPermission('manage_hrms'), updateDesignation)
  .delete(protect, checkPermission('manage_hrms'), deleteDesignation);

module.exports = router;
