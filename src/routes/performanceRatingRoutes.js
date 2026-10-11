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

router.post('/', protect, checkPermission('create_performance_ratings'), addPerformanceRating);
router.get('/', protect, checkPermission('view_performance_ratings'), getPerformanceRatings);
router.get('/:id', protect, checkPermission('view_performance_ratings'), getPerformanceRatingById);
router.put('/:id', protect, checkPermission('edit_performance_ratings'), updatePerformanceRating);
router.delete('/:id', protect, checkPermission('delete_performance_ratings'), deletePerformanceRating);

module.exports = router;
