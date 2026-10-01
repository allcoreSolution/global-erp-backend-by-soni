const express = require('express');
const router = express.Router();
const {
  createCustomerType,
  getCustomerTypes,
  updateCustomerType,
  deleteCustomerType
} = require('../controllers/customerTypeController');

router.post('/', createCustomerType);
router.get('/', getCustomerTypes);
router.put('/:id', updateCustomerType);
router.delete('/:id', deleteCustomerType);

module.exports = router;
