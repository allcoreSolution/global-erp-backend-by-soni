const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getRoles,
  createOrUpdateRole
} = require('../controllers/authController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Public route
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Permission based routes
router.post('/register', protect, checkPermission('manage_users'), registerUser);
router.get('/roles', protect, checkPermission('manage_roles'), getRoles);
router.post('/roles', protect, checkPermission('manage_roles'), createOrUpdateRole);

module.exports = router;
