const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRoles)
  .post(checkPermission('manage_roles'), createRole);

module.exports = router;
