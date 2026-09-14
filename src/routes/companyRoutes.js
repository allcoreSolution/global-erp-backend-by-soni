const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  registerCompany, 
  getCompanies, 
  toggleCompanyStatus, 
  updateSubscription, 
  getMyCompanyProfile, 
  updateCompanyProfile
} = require('../controllers/companyController');

// Middleware for SuperAdmin
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.name === 'SuperAdmin') {
    return next();
  }
  res.status(403);
  next(new Error('Not authorized. Super Admin only.'));
};

router.use(protect);

// Company Admin Routes (accessible by the logged in user of the company)
router.get('/profile', getMyCompanyProfile);
router.put('/profile', updateCompanyProfile);

// Super Admin Routes
router.post('/register', superAdminOnly, registerCompany);
router.get('/', superAdminOnly, getCompanies);
router.put('/:id/toggle-status', superAdminOnly, toggleCompanyStatus);
router.put('/:id/subscription', superAdminOnly, updateSubscription);

module.exports = router;
