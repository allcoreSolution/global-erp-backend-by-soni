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
  .post(protect, checkPermission('create_appraisals'), createAppraisal)
  .get(protect, checkPermission('view_appraisals'), getAppraisals);

router.route('/:id')
  .get(protect, checkPermission('view_appraisals'), getAppraisalById)
  .put(protect, checkPermission('edit_appraisals'), updateAppraisal)
  .delete(protect, checkPermission('delete_appraisals'), deleteAppraisal);

module.exports = router;
