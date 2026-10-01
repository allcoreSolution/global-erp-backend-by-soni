const express = require('express');
const router = express.Router();
const { 
  createAppraisal, 
  getAppraisals, 
  getAppraisalById, 
  updateAppraisal, 
  deleteAppraisal 
} = require('../controllers/appraisalController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_hrms'), createAppraisal)
  .get(protect, getAppraisals);

router.route('/:id')
  .get(protect, getAppraisalById)
  .put(protect, checkPermission('manage_hrms'), updateAppraisal)
  .delete(protect, checkPermission('manage_hrms'), deleteAppraisal);

module.exports = router;
