const express = require('express');
const router = express.Router();
const { getUsers, createUser, toggleUserStatus } = require('../controllers/userController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(checkPermission('manage_users'), createUser);

router.put('/:id/toggle-status', checkPermission('manage_users'), toggleUserStatus);

module.exports = router;
