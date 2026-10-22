const mongoose = require('mongoose');
const { PriceList } = require('../models/PriceList');

const getQueryById = (idParam, company) => {
  const or = [];
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    or.push({ _id: idParam });
  }
  or.push({ id: idParam });
  or.push({ priceListCode: idParam });

  if (company) {
    return { company, $or: or };
  }
  return { $or: or };
};

const createPriceList = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.body.company || '';
    let id = req.body.id || req.body.priceListCode;

    // Check if id is missing or already exists in this company
    const filter = company ? { company, $or: [{ id }, { priceListCode: id }] } : { $or: [{ id }, { priceListCode: id }] };
    const idExists = id ? await PriceList.collection.findOne(filter) : false;

    if (!id || idExists) {
      // Find highest existing PL- number for this company
      const companyQuery = company ? { company } : {};
      const allLists = await PriceList.collection.find(companyQuery, { projection: { id: 1, priceListCode: 1 } }).toArray();
      let maxNum = 0;
      for (const pl of allLists) {
        const val = pl.id || pl.priceListCode || '';
        const match = String(val).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      id = `PL-${String(maxNum + 1).padStart(3, '0')}`;
      while (await PriceList.collection.findOne(company ? { company, $or: [{ id }, { priceListCode: id }] } : { $or: [{ id }, { priceListCode: id }] })) {
        maxNum++;
        id = `PL-${String(maxNum).padStart(3, '0')}`;
      }
    }

    const priceListCode = id; // Keep priceListCode identical to id

    const priceList = await PriceList.create({
      ...req.body,
      id,
      priceListCode,
      company
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
    const company = req.user?.companyId || '';
    const query = getQueryById(req.params.id, company);
    const priceList = await PriceList.findOne(query);
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
    const company = req.user?.companyId || '';
    const query = getQueryById(req.params.id, company);
    const updateData = { ...req.body };
    if (updateData.id && !updateData.priceListCode) {
      updateData.priceListCode = updateData.id;
    }
    const priceList = await PriceList.findOneAndUpdate(query, updateData, {
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
    const company = req.user?.companyId || '';
    const query = getQueryById(req.params.id, company);
    const updateData = { ...req.body };
    if (updateData.id && !updateData.priceListCode) {
      updateData.priceListCode = updateData.id;
    }
    const priceList = await PriceList.findOneAndUpdate(
      query, 
      { $set: updateData }, 
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
    const company = req.user?.companyId || '';
    const query = getQueryById(req.params.id, company);
    const priceList = await PriceList.findOneAndDelete(query);
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
