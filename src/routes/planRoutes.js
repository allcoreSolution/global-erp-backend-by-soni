const express = require('express');
const router = express.Router();
const {
  getAvailableModules,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planController');
const { protect, superAdminOnly } = require('../middlewares/authMiddleware');

// Get all system modules list for building plans (Protected for SuperAdmin)
router.get('/modules', protect, superAdminOnly, getAvailableModules);

router.route('/')
  .get(protect, superAdminOnly, getPlans)
  .post(protect, superAdminOnly, createPlan);

router.route('/:id')
  .get(protect, superAdminOnly, getPlanById)
  .put(protect, superAdminOnly, updatePlan)
  .delete(protect, superAdminOnly, deletePlan);

module.exports = router;
