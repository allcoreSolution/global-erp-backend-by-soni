const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan } = require('../controllers/planController');
const { protect, superAdminOnly } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, superAdminOnly, getPlans)
  .post(protect, superAdminOnly, createPlan);

router.route('/:id')
  .put(protect, superAdminOnly, updatePlan);

module.exports = router;
