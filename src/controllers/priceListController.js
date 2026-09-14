const { PriceList } = require('../models/PriceList');

const createPriceList = async (req, res, next) => {
  try {
    let priceListCode = req.body.priceListCode;
    if (!priceListCode) {
      priceListCode = `PL-${Date.now().toString().slice(-4)}`;
    }
    
    const priceList = await PriceList.create({
      ...req.body,
      priceListCode,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: priceList });
  } catch (error) {
    next(error);
  }
};

const getPriceLists = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const priceLists = await PriceList.find(query);
    res.json({ success: true, data: priceLists });
  } catch (error) {
    next(error);
  }
};

const getPriceListById = async (req, res, next) => {
  try {
    const priceList = await PriceList.findById(req.params.id);
    if (!priceList) {
      res.status(404);
      return next(new Error('Price List not found'));
    }
    res.json({ success: true, data: priceList });
  } catch (error) {
    next(error);
  }
};

const updatePriceList = async (req, res, next) => {
  try {
    const priceList = await PriceList.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!priceList) {
      res.status(404);
      return next(new Error('Price List not found'));
    }
    res.json({ success: true, data: priceList });
  } catch (error) {
    next(error);
  }
};

const patchPriceList = async (req, res, next) => {
  try {
    const priceList = await PriceList.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!priceList) {
      res.status(404);
      return next(new Error('Price List not found'));
    }
    res.json({ success: true, data: priceList });
  } catch (error) {
    next(error);
  }
};

const deletePriceList = async (req, res, next) => {
  try {
    const priceList = await PriceList.findByIdAndDelete(req.params.id);
    if (!priceList) {
      res.status(404);
      return next(new Error('Price List not found'));
    }
    res.json({ success: true, message: 'Price List deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPriceList,
  getPriceLists,
  getPriceListById,
  updatePriceList,
  patchPriceList,
  deletePriceList
};
