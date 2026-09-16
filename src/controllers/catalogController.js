const { Biller } = require('../models/Biller');
const { Warehouse } = require('../models/Warehouse');
const { Currency } = require('../models/Currency');

// Billers
const getBillers = async (req, res, next) => {
  try {
    const billers = await Biller.find({ company: req.user.company });
    res.json({ success: true, data: billers });
  } catch (error) {
    next(error);
  }
};

const createBiller = async (req, res, next) => {
  try {
    const biller = await Biller.create({ ...req.body, company: req.user.company });
    res.status(201).json({ success: true, data: biller });
  } catch (error) {
    next(error);
  }
};

// Warehouses
const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find({ company: req.user.company });
    res.json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create({ ...req.body, company: req.user.company });
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

// Currencies
const getCurrencies = async (req, res, next) => {
  try {
    // Find currencies for company, or allow some default global ones if needed. For now, scoped to company.
    const currencies = await Currency.find({ $or: [{ company: req.user.company }, { company: '' }, { company: null }] });
    res.json({ success: true, data: currencies });
  } catch (error) {
    next(error);
  }
};

const createCurrency = async (req, res, next) => {
  try {
    const currency = await Currency.create({ ...req.body, company: req.user.company });
    res.status(201).json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBillers,
  createBiller,
  getWarehouses,
  createWarehouse,
  getCurrencies,
  createCurrency
};
