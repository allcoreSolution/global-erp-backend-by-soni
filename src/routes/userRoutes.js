const express = require('express');
const router = express.Router();
const { getUsers, createUser, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(checkPermission('view_users'), getUsers)
  .post(checkPermission('create_users'), createUser);

router.put('/:id/toggle-status', checkPermission('edit_users'), toggleUserStatus);
router.delete('/:id', checkPermission('delete_users'), deleteUser);

module.exports = router;
