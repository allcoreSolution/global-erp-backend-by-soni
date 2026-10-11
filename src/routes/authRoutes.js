const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const uploadEmployee = require('../middlewares/uploadEmployee');

// Public route
// Login
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, uploadEmployee.single('profilePhoto'), updateUserProfile);

// Permission based routes
router.post('/register', protect, checkPermission('create_users'), registerUser);

module.exports = router;
