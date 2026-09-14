const express = require('express');
const router = express.Router();
const {
  addDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation
} = require('../controllers/designationController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addDesignation);
router.get('/', protect, checkPermission('manage_hrms'), getDesignations);
router.get('/:id', protect, checkPermission('manage_hrms'), getDesignationById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateDesignation);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteDesignation);

module.exports = router;
