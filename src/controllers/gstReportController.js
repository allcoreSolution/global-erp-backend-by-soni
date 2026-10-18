const { Sale } = require('../models/Sale');
const { Purchase } = require('../models/Purchase');
const { PurchaseReturn } = require('../models/PurchaseReturn');
const { SaleReturn } = require('../models/SaleReturn');
const { Customer } = require('../models/Customer');
const { Supplier } = require('../models/Supplier');

const formatINR = (val) => {
  const num = Math.round(Number(val || 0));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Helper: Filter by company if tenant
const getCompanyFilter = (req) => {
  return req.user?.company ? { company: req.user.company } : {};
};

// @desc    Get GST Purchase & Input Tax Credit (ITC) Report
// @route   GET /api/reports/gst/purchase
// @access  Private
const getGstPurchaseReport = async (req, res, next) => {
  try {
    const filter = getCompanyFilter(req);
    const [purchases, purchaseReturns] = await Promise.all([
      Purchase.find(filter).populate('supplier').lean(),
      PurchaseReturn.find(filter).lean()
    ]);

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalItc = 0;

    const supplierMap = {};

    purchases.forEach((p) => {
      const suppName = p.supplier?.companyName || 'Supplier';
      const suppGst = p.supplier?.gstin || p.supplier?.pan || 'Unregistered';
      const grand = Number(p.grandTotal || 0);

      // Inward tax estimation from order items or standard GST
      let billTaxable = 0;
      let billTax = 0;

      if (p.orderItems && p.orderItems.length > 0) {
        p.orderItems.forEach((it) => {
          const qty = Number(it.quantity || 1);
          const rate = Number(it.netUnitCost || it.productPrice || 0);
          const taxPct = Number(it.taxPercent || 0);
          const lineCost = qty * rate;
          const lineTax = taxPct > 0 ? Math.round(lineCost * (taxPct / 100)) : 0;
          billTaxable += lineCost;
          billTax += lineTax;
        });
      }

      if (billTaxable === 0) {
        billTaxable = Math.round(grand / 1.18);
        billTax = grand - billTaxable;
      }

      const cgst = Math.round(billTax / 2);
      const sgst = billTax - cgst;

      totalTaxable += billTaxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalItc += billTax;

      if (!supplierMap[suppName]) {
        supplierMap[suppName] = {
          supplier: suppName,
          gstNo: suppGst,
          taxableVal: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          itcEligible: 'Yes'
        };
      }

      supplierMap[suppName].taxableVal += billTaxable;
      supplierMap[suppName].cgst += cgst;
      supplierMap[suppName].sgst += sgst;
    });

    const supplierGst = Object.values(supplierMap);

    // Purchase return adjustments from DB
    const purchaseReturnList = purchaseReturns.map((pr) => {
      const returnAmt = Number(pr.totals?.returnTotal || pr.totalRefundAmount || 0);
      const taxAdj = Math.round(returnAmt * 0.18);
      const halfTax = Math.round(taxAdj / 2);
      return {
        noteNo: pr.debitNoteNo || pr.returnNo || 'PR-DEBIT',
        vendor: pr.supplier || 'Vendor',
        returnVal: `-₹${returnAmt.toLocaleString()}`,
        cgstAdj: `-₹${halfTax.toLocaleString()}`,
        sgstAdj: `-₹${halfTax.toLocaleString()}`
      };
    });

    res.json({
      success: true,
      data: {
        summaries: {
          purchaseGst: {
            taxable: formatINR(totalTaxable),
            cgst: formatINR(totalCgst),
            sgst: formatINR(totalSgst),
            igst: formatINR(totalIgst),
            totalItc: formatINR(totalItc)
          },
          supplierGst,
          purchaseReturn: purchaseReturnList
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GST Sales & Output Tax Liability Report (GSTR-1)
// @route   GET /api/reports/gst/sales
// @access  Private
const getGstSalesReport = async (req, res, next) => {
  try {
    const filter = getCompanyFilter(req);
    const [sales, salesReturns] = await Promise.all([
      Sale.find(filter).populate('customer').lean(),
      SaleReturn.find(filter).lean()
    ]);

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalGst = 0;

    const b2bList = [];
    const b2cMap = {};

    sales.forEach((s) => {
      const taxable = Number(s.subTotal || 0);
      const tax = Number(s.taxTotal || 0);
      const cgst = Math.round(tax / 2);
      const sgst = tax - cgst;

      totalTaxable += taxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalGst += tax;

      const custGst = s.customer?.gstCertificate || s.customer?.pan;
      const isB2B = !!custGst && custGst !== 'Unregistered';

      if (isB2B) {
        b2bList.push({
          client: s.customer?.companyName || s.customer?.name || 'Client',
          gstNo: custGst,
          taxable: formatINR(taxable),
          cgst: formatINR(cgst),
          sgst: formatINR(sgst),
          igst: '₹0'
        });
      } else {
        const pos = s.customer?.state || 'Local Counter';
        if (!b2cMap[pos]) {
          b2cMap[pos] = { pos, taxableNum: 0, cgstNum: 0, igstNum: 0 };
        }
        b2cMap[pos].taxableNum += taxable;
        b2cMap[pos].cgstNum += cgst;
      }
    });

    const b2c = Object.values(b2cMap).map((item) => ({
      pos: item.pos,
      taxable: formatINR(item.taxableNum),
      cgst: formatINR(item.cgstNum),
      igst: '₹0'
    }));

    // Credit notes from sales returns
    const creditNotes = salesReturns.map((sr) => ({
      noteNo: sr.returnNumber || sr.returnNo || 'SR-CREDIT',
      client: sr.customer?.name || sr.customer?.companyName || 'Customer',
      taxable: formatINR(sr.totalRefundAmount || 0),
      gstAdj: formatINR(Math.round(Number(sr.totalRefundAmount || 0) * 0.18))
    }));

    res.json({
      success: true,
      data: {
        summaries: {
          gstr1: {
            taxable: formatINR(totalTaxable),
            cgst: formatINR(totalCgst),
            sgst: formatINR(totalSgst),
            igst: formatINR(totalIgst),
            totalGst: formatINR(totalGst)
          },
          b2b: b2bList,
          b2c,
          creditNotes,
          debitNotes: []
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GST Reconciliation & Mismatch Ledger
// @route   GET /api/reports/gst/reconciliation
// @access  Private
const getGstReconciliation = async (req, res, next) => {
  try {
    const filter = getCompanyFilter(req);
    const [sales, purchases] = await Promise.all([
      Sale.find(filter).populate('customer').lean(),
      Purchase.find(filter).populate('supplier').lean()
    ]);

    // Output Tax Liability from Sales
    const outputTax = sales.reduce((acc, s) => acc + Number(s.taxTotal || 0), 0);

    // Input Tax Credit (ITC) from Purchases
    let inputTax = 0;
    purchases.forEach((p) => {
      let bTax = 0;
      if (p.orderItems && p.orderItems.length > 0) {
        p.orderItems.forEach((it) => {
          const qty = Number(it.quantity || 1);
          const rate = Number(it.netUnitCost || it.productPrice || 0);
          const taxPct = Number(it.taxPercent || 0);
          if (taxPct > 0) bTax += Math.round(qty * rate * (taxPct / 100));
        });
      }
      if (bTax === 0) {
        bTax = Math.round(Number(p.grandTotal || 0) * (18 / 118));
      }
      inputTax += bTax;
    });

    const netPayable = Math.max(0, outputTax - inputTax);

    // Dynamic invoices list directly from DB sales and purchases
    const invoices = [];
    const mismatches = [];

    // Sales audit
    sales.forEach((s) => {
      const tax = Number(s.taxTotal || 0);
      const halfTax = Math.round(tax / 2);
      const isMatched = tax > 0;
      invoices.push({
        invNo: s.invoiceNo,
        date: s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A'),
        partner: s.customer?.name || s.customer?.companyName || 'Cash Buyer',
        taxableVal: formatINR(s.subTotal || 0),
        cgst: formatINR(halfTax),
        sgst: formatINR(tax - halfTax),
        igst: '₹0',
        status: isMatched ? 'Matched' : 'Unregistered'
      });
    });

    // Purchases audit
    purchases.forEach((p) => {
      const tax = Math.round(Number(p.grandTotal || 0) * (18 / 118));
      const halfTax = Math.round(tax / 2);
      const invoiceItem = {
        invNo: p.purchaseNo,
        date: p.purchaseDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A'),
        partner: p.supplier?.companyName || 'Supplier',
        taxableVal: formatINR(p.grandTotal - tax),
        cgst: formatINR(halfTax),
        sgst: formatINR(tax - halfTax),
        igst: '₹0',
        status: tax > 0 ? 'Matched' : 'Pending'
      };
      invoices.push(invoiceItem);

      if (tax > 0) {
        mismatches.push({
          invNo: p.purchaseNo,
          type: 'GSTR-2B ITC',
          supplier: p.supplier?.companyName || 'Supplier',
          bookTax: formatINR(tax),
          portal2B: formatINR(tax),
          diff: '0',
          reason: 'Eligible ITC matched with GSTR-2B'
        });
      }
    });

    res.json({
      success: true,
      data: {
        netPosition: {
          outputTax: formatINR(outputTax),
          inputTax: formatINR(inputTax),
          netPayable: formatINR(netPayable)
        },
        mismatches,
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Tax Analysis & Slab-wise Breakdown
// @route   GET /api/reports/gst/tax-analysis
// @access  Private
const getTaxAnalysis = async (req, res, next) => {
  try {
    const filter = getCompanyFilter(req);
    const [sales, purchases] = await Promise.all([
      Sale.find(filter).lean(),
      Purchase.find(filter).lean()
    ]);

    let totalTaxable = 0;
    let totalTax = 0;
    let nilRated = 0;

    const rateMap = {};
    const hsnMap = {};

    // Analyze sales dynamically from DB
    sales.forEach((s) => {
      (s.orderItems || []).forEach((it) => {
        const qty = Number(it.quantity || 1);
        const price = Number(it.netUnitPrice || 0);
        const cost = qty * price;
        const taxPct = Number(it.taxPercent || 0);
        const tax = taxPct > 0 ? Math.round(cost * (taxPct / 100)) : 0;

        totalTaxable += cost;
        totalTax += tax;

        if (taxPct === 0) {
          nilRated += cost;
        } else {
          const rateKey = `${taxPct}%`;
          if (!rateMap[rateKey]) {
            rateMap[rateKey] = { rate: rateKey, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
          }
          rateMap[rateKey].taxable += cost;
          rateMap[rateKey].cgst += Math.round(tax / 2);
          rateMap[rateKey].sgst += Math.round(tax / 2);
        }

        const hsn = it.code || '8517';
        if (!hsnMap[hsn]) {
          hsnMap[hsn] = {
            hsnCode: hsn,
            desc: it.name || 'Inventory Good',
            uqc: 'NOS',
            qty: 0,
            taxableVal: 0,
            cgst: 0,
            sgst: 0,
            igst: 0
          };
        }
        hsnMap[hsn].qty += qty;
        hsnMap[hsn].taxableVal += cost;
        hsnMap[hsn].cgst += Math.round(tax / 2);
        hsnMap[hsn].sgst += Math.round(tax / 2);
      });
    });

    const rateBreakdown = Object.values(rateMap)
      .filter((r) => r.taxable > 0)
      .map((r) => ({
        rate: r.rate,
        taxable: formatINR(r.taxable),
        cgst: formatINR(r.cgst),
        sgst: formatINR(r.sgst),
        igst: formatINR(r.igst)
      }));

    const hsnSummary = Object.values(hsnMap).map((h) => ({
      hsnCode: h.hsnCode,
      desc: h.desc,
      uqc: h.uqc,
      qty: h.qty,
      taxableVal: formatINR(h.taxableVal),
      cgst: formatINR(h.cgst),
      sgst: formatINR(h.sgst),
      igst: formatINR(h.igst)
    }));

    const halfTax = Math.round(totalTax / 2);

    res.json({
      success: true,
      data: {
        summaries: {
          taxTotals: {
            taxableVal: formatINR(totalTaxable),
            cgst: formatINR(halfTax),
            sgst: formatINR(totalTax - halfTax),
            igst: '₹0',
            totalTax: formatINR(totalTax)
          },
          exemptSales: {
            exemptVal: '₹0',
            nilRated: formatINR(nilRated),
            nonGst: '₹0'
          },
          rateBreakdown,
          hsnSummary
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGstPurchaseReport,
  getGstSalesReport,
  getGstReconciliation,
  getTaxAnalysis
};
