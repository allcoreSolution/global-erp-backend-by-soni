const express = require('express');
const router = express.Router();
const { getUserActivities, logUserActivity } = require('../controllers/userActivityController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getUserActivities)
  .post(protect, logUserActivity);

module.exports = router;
