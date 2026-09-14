const { Customer } = require('../models/Customer');

const createCustomer = async (req, res, next) => {
  try {
    let customerCode = req.body.customerCode;
    if (!customerCode) {
      customerCode = `CUST-${Date.now().toString().slice(-4)}`;
    }
    
    const customer = await Customer.create({
      ...req.body,
      customerCode
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const customers = await Customer.find(query);
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const patchCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  patchCustomer,
  deleteCustomer
};
