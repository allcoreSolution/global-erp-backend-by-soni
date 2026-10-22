const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  patchCustomer,
  deleteCustomer,
  getCustomersLedgerSummary,
  getCustomerLedgerDetails
} = require('../controllers/customerController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/ledger/summary', protect, checkPermission(['view_contacts', 'view_sales']), getCustomersLedgerSummary);
router.get('/:id/ledger', protect, checkPermission(['view_contacts', 'view_sales']), getCustomerLedgerDetails);

router.get('/', protect, checkPermission('view_contacts'), getCustomers);
router.get('/:id', protect, checkPermission('view_contacts'), getCustomerById);
router.post('/', protect, checkPermission('create_contacts'), createCustomer);
router.put('/:id', protect, checkPermission('edit_contacts'), updateCustomer);
router.patch('/:id', protect, checkPermission('edit_contacts'), patchCustomer);
router.delete('/:id', protect, checkPermission('delete_contacts'), deleteCustomer);

module.exports = router;
