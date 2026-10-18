const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getNotifications, 
  getNotificationList,
  getTargets,
  createNotification, 
  markAsRead, 
  clearAllNotifications,
  deleteNotification
} = require('../controllers/notificationController');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.get('/list', getNotificationList);
router.get('/targets', getTargets);
router.put('/clear-all', clearAllNotifications);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;