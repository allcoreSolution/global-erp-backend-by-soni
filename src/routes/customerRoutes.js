const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  patchCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.post('/', protect, checkPermission('manage_contacts'), createCustomer);
router.put('/:id', protect, checkPermission('manage_contacts'), updateCustomer);
router.patch('/:id', protect, checkPermission('manage_contacts'), patchCustomer);
router.delete('/:id', protect, checkPermission('manage_contacts'), deleteCustomer);

module.exports = router;
