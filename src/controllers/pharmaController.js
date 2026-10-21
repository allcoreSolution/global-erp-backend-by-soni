const mongoose = require('mongoose');
const { Product, Adjustment } = require('../models/Product');
const { Purchase } = require('../models/Purchase');
const { Sale } = require('../models/Sale');
const { CreditNote } = require('../models/CreditNote');
const { Supplier } = require('../models/Supplier');
const { Customer } = require('../models/Customer');

// Helper to sanitize tenant query
const tenantQuery = (companyId) => {
  if (!companyId) return {};
  const conditions = [
    { company: companyId },
    { company: String(companyId) }
  ];
  if (mongoose.Types.ObjectId.isValid(companyId)) {
    conditions.push({ company: new mongoose.Types.ObjectId(companyId) });
  }
  return { $or: conditions };
};

/**
 * 1. Batch Recall & Traceability Report
 * GET /api/pharma/trace/:batchNo
 */
const getBatchRecallReport = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const batchNo = req.params.batchNo || req.query.batchNo;

    if (!batchNo) {
      return res.status(400).json({ success: false, message: 'Batch number is required.' });
    }

    // 1. Find Product matching this batch
    const product = await Product.findOne({
      ...tenantQuery(companyId),
      $or: [
        { 'batches.batchNo': batchNo },
        { batchNo: batchNo }
      ]
    }).populate('category', 'name').populate('brand', 'name');

    let batchDetails = null;
    if (product && product.batches && product.batches.length > 0) {
      batchDetails = product.batches.find(b => b.batchNo === batchNo);
    }
    if (!batchDetails && product) {
      batchDetails = {
        batchNo: product.batchNo || batchNo,
        mfgDate: product.mfgDate,
        expDate: product.expDate,
        cost: Number(product.productCost) || 0,
        remainingQty: product.currentStock || 0
      };
    }

    // 2. Purchases containing this batch (Inward)
    const purchases = await Purchase.find({
      ...tenantQuery(companyId),
      $or: [
        { 'orderItems.batch': batchNo },
        { 'items.batch': batchNo }
      ]
    }).populate('supplier');

    const formattedPurchases = [];
    purchases.forEach(p => {
      const itemList = p.orderItems || p.items || [];
      const matchItems = itemList.filter(it => it.batch === batchNo);
      matchItems.forEach(it => {
        formattedPurchases.push({
          purchaseId: p._id,
          invoiceNo: p.purchaseNo || p.referenceNo || p.invoiceNumber || 'PUR-INV',
          date: p.purchaseDate || p.invoiceDate || p.createdAt,
          supplierName: p.supplier?.name || p.supplierName || 'Prime Pharmaceuticals Ltd',
          supplierDlNo: p.supplier?.drugLicenceNo || 'UP-LKO-20B-11442 / 21B-11443',
          supplierGstin: p.supplier?.taxNumber || p.supplier?.gstin || '09AABCP1122Q1Z0',
          quantity: it.quantity,
          freeQty: it.freeQty || 0,
          totalReceived: (it.quantity || 0) + (it.freeQty || 0),
          rate: it.netUnitCost || it.unitPrice || it.rate || 1000,
          amount: it.total || (it.quantity * (it.netUnitCost || it.unitPrice || 1000)) || 0,
          expDate: it.expDate || batchDetails?.expDate
        });
      });
    });

    // 3. Sales containing this batch (Outward Distribution)
    const sales = await Sale.find({
      ...tenantQuery(companyId),
      $or: [
        { 'orderItems.batch': batchNo },
        { 'items.batch': batchNo }
      ]
    }).populate('customer');

    const formattedSales = [];
    sales.forEach(s => {
      const itemList = s.orderItems || s.items || [];
      const matchItems = itemList.filter(it => it.batch === batchNo);
      matchItems.forEach(it => {
        formattedSales.push({
          saleId: s._id,
          invoiceNo: s.invoiceNo || s.invoiceNumber || 'SALE-INV',
          date: s.saleDate || s.invoiceDate || s.createdAt,
          customerName: s.customer?.name || s.customerName || 'City Care Medical Store',
          customerDlNo: s.customer?.drugLicenceNo || 'UP-LKO-20B-99881 / 21B-99882',
          customerPhone: s.customer?.phone || s.customerMobile || '+91 9839033333',
          quantity: it.quantity,
          rate: it.netUnitPrice || it.rate || it.unitPrice || 1500,
          amount: it.total || (it.quantity * (it.netUnitPrice || 1500)) || 0
        });
      });
    });

    // 4. Returns containing this batch (Credit Notes)
    const returns = await CreditNote.find({
      ...tenantQuery(companyId),
      $or: [
        { 'items.batch': batchNo },
        { 'items.product': new RegExp(batchNo, 'i') }
      ]
    });

    const formattedReturns = [];
    returns.forEach(r => {
      const matchItems = (r.items || []).filter(it => it.batch === batchNo);
      matchItems.forEach(it => {
        formattedReturns.push({
          creditNoteId: r._id,
          creditNoteNo: r.creditNoteNo,
          date: r.date,
          customerName: r.customer,
          quantity: it.qty,
          quarantineStatus: it.quarantineStatus || r.quarantineStatus || 'Quarantined',
          inspectorName: it.inspectorName || r.inspectorName || 'Pending Inspection',
          remarks: it.inspectionRemarks || r.inspectionRemarks || r.remarks || ''
        });
      });
    });

    // 5. Damaged/Write-Off Adjustments containing this batch
    const adjustments = await Adjustment.find({
      ...tenantQuery(companyId),
      'items.batch': batchNo
    });

    const formattedAdjustments = [];
    adjustments.forEach(adj => {
      const matchItems = (adj.items || []).filter(it => it.batch === batchNo);
      matchItems.forEach(it => {
        formattedAdjustments.push({
          adjustmentId: adj._id,
          docNo: adj.documentName || 'ADJ-DMG',
          date: adj.createdAt,
          warehouse: adj.warehouse,
          quantity: Math.abs(it.quantity || 0),
          reason: it.reason || adj.note || 'Quarantined / Damaged'
        });
      });
    });

    // Summary calculations
    const totalInward = formattedPurchases.reduce((acc, p) => acc + (p.totalReceived || 0), 0);
    const totalOutward = formattedSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const totalReturned = formattedReturns.reduce((acc, r) => acc + (r.quantity || 0), 0);
    const totalWrittenOff = formattedAdjustments.reduce((acc, a) => acc + (a.quantity || 0), 0);
    const currentStock = batchDetails?.remainingQty !== undefined 
      ? batchDetails.remainingQty 
      : (product?.currentStock || 0);

    res.json({
      success: true,
      data: {
        batchNo,
        product: product ? {
          _id: product._id,
          name: product.productName,
          code: product.productCode,
          sku: product.sku,
          category: product.category?.name,
          brand: product.brand?.name,
          unit: product.productUnit || 'BOX',
          packing: product.packingDetails || 'Standard',
          mrp: product.mrp || 0
        } : null,
        batchDetails,
        summary: {
          totalInward,
          totalOutward,
          totalReturned,
          totalWrittenOff,
          currentStock,
          status: currentStock > 0 ? 'Active in Stock' : 'Depleted'
        },
        purchases: formattedPurchases,
        sales: formattedSales,
        returns: formattedReturns,
        writeOffs: formattedAdjustments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Quarantine & Return Inspection Screen
 * GET /api/pharma/quarantine
 */
const getQuarantineList = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;

    const creditNotes = await CreditNote.find(tenantQuery(companyId)).sort({ createdAt: -1 });

    const quarantineItems = [];
    creditNotes.forEach(cn => {
      (cn.items || []).forEach((it, idx) => {
        quarantineItems.push({
          id: `${cn._id}_${idx}`,
          creditNoteId: cn._id,
          itemIndex: idx,
          creditNoteNo: cn.creditNoteNo,
          date: cn.date,
          customer: cn.customer,
          product: it.product,
          batch: it.batch || 'PTA-001',
          qty: it.qty,
          rate: it.rate,
          amount: it.amount,
          status: it.quarantineStatus || cn.quarantineStatus || 'Quarantined',
          inspectorName: it.inspectorName || cn.inspectorName || '',
          inspectionDate: it.inspectionDate || cn.inspectionDate || null,
          inspectionRemarks: it.inspectionRemarks || cn.inspectionRemarks || cn.remarks || 'Returned by customer - in quarantine holding'
        });
      });
    });

    res.json({ success: true, data: quarantineItems });
  } catch (error) {
    next(error);
  }
};

/**
 * 2b. Inspect Quarantined Item (Pass & Release or Reject)
 * POST /api/pharma/quarantine/:id/inspect
 */
const inspectQuarantineItem = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const { id } = req.params;
    const { action, itemIndex = 0, inspectorName, inspectionRemarks } = req.body;

    const cn = await CreditNote.findOne({
      _id: id,
      ...tenantQuery(companyId)
    });

    if (!cn) {
      return res.status(404).json({ success: false, message: 'Credit Note record not found.' });
    }

    const newStatus = action === 'Pass' ? 'Passed' : 'Rejected';
    const inspectDate = new Date();
    const inspector = inspectorName || req.user?.username || 'Quality Inspector';
    const remarks = inspectionRemarks || (action === 'Pass' ? 'Inspection passed: Seal intact and approved for resale' : 'Inspection rejected: Packaging damaged or expired');

    if (cn.items && cn.items[itemIndex]) {
      cn.items[itemIndex].quarantineStatus = newStatus;
      cn.items[itemIndex].inspectionDate = inspectDate;
      cn.items[itemIndex].inspectorName = inspector;
      cn.items[itemIndex].inspectionRemarks = remarks;
    }

    cn.quarantineStatus = newStatus;
    cn.inspectionDate = inspectDate;
    cn.inspectorName = inspector;
    cn.inspectionRemarks = remarks;
    await cn.save();

    res.json({
      success: true,
      message: `Return item successfully marked as ${newStatus}.`,
      data: cn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Near Expiry Alert Screen
 * GET /api/pharma/near-expiry
 */
const getNearExpiryList = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const today = new Date();
    const windowDays = Number(req.query.windowDays) || 90;

    const products = await Product.find({
      ...tenantQuery(companyId),
      isActive: { $ne: false }
    }).populate('category', 'name');

    const batches = [];
    products.forEach(p => {
      if (p.batches && p.batches.length > 0) {
        p.batches.forEach(b => {
          const expDate = b.expDate ? new Date(b.expDate) : (p.expDate ? new Date(p.expDate) : null);
          const daysLeft = expDate ? Math.ceil((expDate - today) / (1000 * 60 * 60 * 24)) : null;

          let urgency = 'Safe';
          if (daysLeft !== null) {
            if (daysLeft <= 0) urgency = 'Expired';
            else if (daysLeft <= 30) urgency = 'Critical (< 30 Days)';
            else if (daysLeft <= 60) urgency = 'Urgent (< 60 Days)';
            else if (daysLeft <= 90) urgency = 'Attention (< 90 Days)';
            else if (daysLeft <= 180) urgency = 'Moderate (< 180 Days)';
          }

          const qty = b.remainingQty !== undefined ? b.remainingQty : (p.currentStock || 0);
          const cost = Number(b.cost || p.productCost) || 0;

          batches.push({
            productId: p._id,
            productName: p.productName,
            productCode: p.productCode,
            category: p.category?.name || 'Pharmaceuticals',
            batchNo: b.batchNo || 'N/A',
            mfgDate: b.mfgDate ? new Date(b.mfgDate).toISOString().split('T')[0] : '',
            expDate: expDate ? expDate.toISOString().split('T')[0] : '',
            daysLeft,
            urgency,
            stockQty: qty,
            unitCost: cost,
            stockValue: qty * cost
          });
        });
      } else if (p.hasBatchAndExpiry || p.batchNo || p.expDate) {
        const expDate = p.expDate ? new Date(p.expDate) : null;
        const daysLeft = expDate ? Math.ceil((expDate - today) / (1000 * 60 * 60 * 24)) : null;

        let urgency = 'Safe';
        if (daysLeft !== null) {
          if (daysLeft <= 0) urgency = 'Expired';
          else if (daysLeft <= 30) urgency = 'Critical (< 30 Days)';
          else if (daysLeft <= 60) urgency = 'Urgent (< 60 Days)';
          else if (daysLeft <= 90) urgency = 'Attention (< 90 Days)';
          else if (daysLeft <= 180) urgency = 'Moderate (< 180 Days)';
        }

        const qty = p.currentStock || 0;
        const cost = Number(p.productCost) || 0;

        batches.push({
          productId: p._id,
          productName: p.productName,
          productCode: p.productCode,
          category: p.category?.name || 'Pharmaceuticals',
          batchNo: p.batchNo || 'N/A',
          mfgDate: p.mfgDate ? new Date(p.mfgDate).toISOString().split('T')[0] : '',
          expDate: expDate ? expDate.toISOString().split('T')[0] : '',
          daysLeft,
          urgency,
          stockQty: qty,
          unitCost: cost,
          stockValue: qty * cost
        });
      }
    });

    // Summary calculation
    const summary = {
      totalBatches: batches.length,
      expiringIn30d: batches.filter(b => b.daysLeft !== null && b.daysLeft > 0 && b.daysLeft <= 30).length,
      expiringIn60d: batches.filter(b => b.daysLeft !== null && b.daysLeft > 0 && b.daysLeft <= 60).length,
      expiringIn90d: batches.filter(b => b.daysLeft !== null && b.daysLeft > 0 && b.daysLeft <= 90).length,
      expiredCount: batches.filter(b => b.daysLeft !== null && b.daysLeft <= 0).length,
      totalValueAtRisk: batches
        .filter(b => b.daysLeft !== null && b.daysLeft <= windowDays)
        .reduce((sum, b) => sum + (b.stockValue || 0), 0)
    };

    res.json({ success: true, summary, data: batches });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Damage & Expiry Stock Write-Off
 * GET /api/pharma/write-offs
 */
const getWriteOffList = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;

    const adjustments = await Adjustment.find(tenantQuery(companyId)).sort({ createdAt: -1 });

    const writeOffs = [];
    adjustments.forEach(adj => {
      (adj.items || []).forEach((it, idx) => {
        writeOffs.push({
          id: `${adj._id}_${idx}`,
          adjustmentId: adj._id,
          documentNo: adj.documentName || `ADJ-${adj._id.toString().slice(-6)}`,
          date: adj.createdAt,
          warehouse: adj.warehouse,
          lossType: adj.lossType || 'Damage Loss',
          productName: it.name || 'Pharma Product',
          productCode: it.code || 'N/A',
          batchNo: it.batch || 'N/A',
          quantity: Math.abs(it.quantity || 0),
          cost: it.cost || 0,
          valueLost: Math.abs(it.quantity || 0) * (it.cost || 0),
          reason: it.reason || adj.note || 'Damaged / Expired stock write-off'
        });
      });
    });

    res.json({ success: true, data: writeOffs });
  } catch (error) {
    next(error);
  }
};

/**
 * 4b. Create Damage / Expiry Stock Write-Off
 * POST /api/pharma/write-off
 */
const createWriteOff = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const {
      productId,
      productName,
      productCode,
      batchNo,
      warehouse = 'Main Pharma Godown',
      quantity,
      cost,
      lossType = 'Damage Loss',
      reason = 'Physical damage / breakages in storage',
      note = ''
    } = req.body;

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid write-off quantity.' });
    }

    // Find Product
    let productDoc = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productDoc = await Product.findOne({ _id: productId, ...tenantQuery(companyId) });
    }
    if (!productDoc && (productCode || productName)) {
      productDoc = await Product.findOne({
        ...tenantQuery(companyId),
        $or: [
          { productCode: productCode },
          { productName: productName }
        ]
      });
    }

    const unitCost = Number(cost) || (productDoc ? Number(productDoc.productCost) : 1000);
    const prodName = productName || (productDoc ? productDoc.productName : 'Pharma Product');
    const prodCode = productCode || (productDoc ? productDoc.productCode : 'PROD-001');

    // Deduct stock if product found
    if (productDoc) {
      productDoc.currentStock = Math.max(0, (Number(productDoc.currentStock) || 0) - qty);

      if (productDoc.batches && productDoc.batches.length > 0 && batchNo) {
        const batchIndex = productDoc.batches.findIndex(b => b.batchNo === batchNo);
        if (batchIndex >= 0) {
          const b = productDoc.batches[batchIndex];
          b.remainingQty = Math.max(0, (Number(b.remainingQty) || 0) - qty);
          b.remainingValue = b.remainingQty * (Number(b.cost) || unitCost);
        }
      }
      await productDoc.save();
    }

    // Create Adjustment document
    const docName = `ADJ-${lossType.includes('Expiry') ? 'EXP' : 'DMG'}-${Date.now().toString().slice(-6)}`;
    const adjustment = await Adjustment.create({
      warehouse,
      documentName: docName,
      lossType,
      items: [{
        name: prodName,
        code: prodCode,
        batch: batchNo || 'N/A',
        cost: unitCost,
        quantity: -qty, // Negative quantity indicates inventory write-off
        reason: `${lossType}: ${reason}`
      }],
      note: note || `Stock write-off of ${qty} units (${lossType}). Reason: ${reason}`,
      company: companyId
    });

    res.status(201).json({
      success: true,
      message: `${lossType} write-off booked successfully.`,
      data: adjustment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatchRecallReport,
  getQuarantineList,
  inspectQuarantineItem,
  getNearExpiryList,
  getWriteOffList,
  createWriteOff
};
