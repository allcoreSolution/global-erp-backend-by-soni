const fs = require('fs');
const path = require('path');

const entities = [
  { name: 'SupplierType', route: 'supplier-types' },
  { name: 'SupplierCategory', route: 'supplier-categories' },
  { name: 'TaxPreference', route: 'tax-preferences' },
  { name: 'PaymentTerm', route: 'payment-terms' }
];

const basePath = 'c:\\Users\\Soni Tiwari\\Desktop\\ACS PROJECT\\Latest_erp_globl\\Backend_Api\'s\\src';

entities.forEach(entity => {
  // 1. Create Model
  const modelContent = `const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  company: { type: String, default: '' },
  value: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('${entity.name}', schema);
`;
  fs.writeFileSync(path.join(basePath, 'models', `${entity.name}.js`), modelContent);

  // 2. Create Controller
  const controllerContent = `const ${entity.name} = require('../models/${entity.name}');

exports.getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.user?.companyId) query.company = req.user.companyId;
    const items = await ${entity.name}.find(query);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (!value) return res.status(400).json({ success: false, message: 'Value is required' });
    const newItem = await ${entity.name}.create({ value, company: req.user?.companyId || req.body.company });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};
`;
  const controllerName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1) + 'Controller';
  fs.writeFileSync(path.join(basePath, 'controllers', `${controllerName}.js`), controllerContent);

  // 3. Create Routes
  const routeContent = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/${controllerName}');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, controller.getAll).post(protect, controller.create);

module.exports = router;
`;
  const routeName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1) + 'Routes';
  fs.writeFileSync(path.join(basePath, 'routes', `${routeName}.js`), routeContent);
});

console.log('Successfully created all individual models, controllers, and routes!');
