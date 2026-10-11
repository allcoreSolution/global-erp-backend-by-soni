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
  .post(protect, checkPermission('create_designations'), createDesignation)
  .get(protect, checkPermission('view_designations'), getDesignations);

router.route('/:id')
  .get(protect, checkPermission('view_designations'), getDesignationById)
  .put(protect, checkPermission('edit_designations'), updateDesignation)
  .delete(protect, checkPermission('delete_designations'), deleteDesignation);

module.exports = router;
