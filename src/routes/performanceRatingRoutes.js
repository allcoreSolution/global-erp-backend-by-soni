const express = require('express');
const router = express.Router();
const {
  addPerformanceRating,
  getPerformanceRatings,
  getPerformanceRatingById,
  updatePerformanceRating,
  deletePerformanceRating
} = require('../controllers/performanceRatingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addPerformanceRating);
router.get('/', protect, checkPermission('manage_hrms'), getPerformanceRatings);
router.get('/:id', protect, checkPermission('manage_hrms'), getPerformanceRatingById);
router.put('/:id', protect, checkPermission('manage_hrms'), updatePerformanceRating);
router.delete('/:id', protect, checkPermission('manage_hrms'), deletePerformanceRating);

module.exports = router;
