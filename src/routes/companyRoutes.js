const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  registerCompany, 
  getCompanies, 
  updateSubscription, 
  getMyCompanyProfile, 
  updateCompanyProfile,
  deleteCompany,
  toggleCompanyStatus,
  updateCompany,
  getCompanyById,
  getSubscriptions,
  renewSubscription
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

// Super Admin Routes (Register & Subscription management)
router.post('/register', superAdminOnly, registerCompany);
router.get('/subscriptions', superAdminOnly, getSubscriptions);
router.put('/:id/subscription', superAdminOnly, updateSubscription);
router.post('/:id/renew', superAdminOnly, renewSubscription);
router.get('/:id', superAdminOnly, getCompanyById);
router.put('/:id', superAdminOnly, updateCompany);
router.delete('/:id', superAdminOnly, deleteCompany);
router.patch('/:id/status', superAdminOnly, toggleCompanyStatus);

// Companies list (SuperAdmin gets all; other users can read for branch/warehouse company dropdowns)
router.get('/', getCompanies);

module.exports = router;
