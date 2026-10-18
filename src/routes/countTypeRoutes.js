const express = require('express');
const router = express.Router();
const {
  getCountTypes,
  createCountType,
  updateCountType,
  deleteCountType
} = require('../controllers/countTypeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('view_count_types'), getCountTypes);
router.post('/', protect, checkPermission('create_count_types'), createCountType);
router.put('/:id', protect, checkPermission('edit_count_types'), updateCountType);
router.delete('/:id', protect, checkPermission('delete_count_types'), deleteCountType);

module.exports = router;
