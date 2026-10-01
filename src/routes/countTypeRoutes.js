const express = require('express');
const router = express.Router();
const {
  getCountTypes,
  createCountType,
  updateCountType,
  deleteCountType
} = require('../controllers/countTypeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getCountTypes);
router.post('/', protect, checkPermission('manage_settings'), createCountType);
router.put('/:id', protect, checkPermission('manage_settings'), updateCountType);
router.delete('/:id', protect, checkPermission('manage_settings'), deleteCountType);

module.exports = router;
