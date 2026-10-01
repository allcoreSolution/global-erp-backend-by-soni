const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.use(protect);
router.route('/').get(getNotifications);
router.route('/:id/read').put(markAsRead);

module.exports = router;