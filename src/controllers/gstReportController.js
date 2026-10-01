const sendMockData = (res, data) => res.json({ success: true, data });

const getGstPurchaseReport = async (req, res, next) => {
  try {
    const summaries = {
      purchaseGst: { taxable: '₹9,80,000', cgst: '₹88,200', sgst: '₹88,200', igst: '₹36,000', totalItc: '₹2,12,400' },
      supplierGst: [
        { supplier: 'Ambani Raw Materials', gstNo: '27AMBAN9999A1Z9', taxableVal: 400000, cgst: 36000, sgst: 36000, igst: 0, itcEligible: 'Yes' },
        { supplier: 'Vikas Tech Solutions', gstNo: '27VIKAS8888B2Z8', taxableVal: 200000, cgst: 0, sgst: 0, igst: 36000, itcEligible: 'Yes' },
        { supplier: 'Modern Stationary', gstNo: '27MODER5555C3Z7', taxableVal: 50000, cgst: 4500, sgst: 4500, igst: 0, itcEligible: 'Yes' }
      ],
      purchaseReturn: [
        { noteNo: 'PR-CN01', vendor: 'Ambani Raw Materials', returnVal: '₹-30,000', cgstAdj: '₹-2,700', sgstAdj: '₹-2,700' }
      ]
    };
    sendMockData(res, { summaries });
  } catch (error) { next(error); }
};

const getGstSalesReport = async (req, res, next) => {
  try {
    const summaries = {
      gstr1: { taxable: '₹14,50,000', cgst: '₹1,30,500', sgst: '₹1,30,500', igst: '₹54,000', totalGst: '₹3,15,000' },
      b2b: [
        { client: 'Aditya Enterprises', gstNo: '27ADITY9999A1Z9', taxable: '₹5,00,000', cgst: '₹45,000', sgst: '₹45,000', igst: '₹0' },
        { client: 'Vikas Trading', gstNo: '27VIKAS8888B2Z8', taxable: '₹2,50,000', cgst: '₹0', sgst: '₹0', igst: '₹45,000' }
      ],
      b2c: [
        { pos: 'Maharashtra', taxable: '₹1,50,000', cgst: '₹13,500', igst: '₹0' },
        { pos: 'Gujarat', taxable: '₹50,000', cgst: '₹0', igst: '₹9,000' }
      ],
      creditNotes: [
        { noteNo: 'SR-CN05', client: 'Aditya Enterprises', taxable: '₹50,000', gstAdj: '₹9,000' }
      ],
      debitNotes: [
        { noteNo: 'SR-DN02', client: 'Vikas Trading', taxable: '₹10,000', gstAdjust: '₹1,800' }
      ]
    };
    sendMockData(res, { summaries });
  } catch (error) { next(error); }
};

const getGstReconciliation = async (req, res, next) => {
  try {
    const data = {
      netPosition: { outputTax: '₹5,40,000', inputTax: '₹4,80,000', netPayable: '₹60,000' },
      mismatches: [
        { invNo: 'INV-2026/001', type: 'B2B', client: 'Reliance Industries', bookTax: '₹45,000', portal2B: '₹40,000', diff: '₹5,000', reason: 'Partial upload by supplier' },
        { invNo: 'INV-2026/089', type: 'B2B', supplier: 'Tata Steel', bookTax: '₹12,000', portal2B: '₹0', diff: '₹12,000', reason: 'Invoice not filed in GSTR-1' }
      ],
      invoices: [
        { invNo: 'INV-2026/001', date: '01-Sep-2026', partner: 'Reliance Industries', taxableVal: '₹2,50,000', cgst: '₹22,500', sgst: '₹22,500', igst: '₹0', status: 'Mismatch' },
        { invNo: 'INV-2026/002', date: '05-Sep-2026', partner: 'Adani Power', taxableVal: '₹1,00,000', cgst: '₹0', sgst: '₹0', igst: '₹18,000', status: 'Matched' },
        { invNo: 'INV-2026/089', date: '10-Sep-2026', partner: 'Tata Steel', taxableVal: '₹66,666', cgst: '₹6,000', sgst: '₹6,000', igst: '₹0', status: 'Mismatch' }
      ]
    };
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getTaxAnalysis = async (req, res, next) => {
  try {
    const summaries = {
      taxTotals: { taxableVal: '₹24,50,000', cgst: '₹2,18,700', sgst: '₹2,18,700', igst: '₹90,000', totalTax: '₹5,27,400' },
      exemptSales: { exemptVal: '₹1,50,000', nilRated: '₹50,000', nonGst: '₹20,000' },
      rateBreakdown: [
        { rate: '18%', taxable: '₹12,00,000', cgst: '₹1,08,000', sgst: '₹1,08,000', igst: '₹0' },
        { rate: '12%', taxable: '₹8,50,000', cgst: '₹0', sgst: '₹0', igst: '₹1,02,000' },
        { rate: '5%', taxable: '₹4,00,000', cgst: '₹10,000', sgst: '₹10,000', igst: '₹0' }
      ],
      hsnSummary: [
        { hsnCode: '8517', desc: 'Telephones & Mobiles', uqc: 'NOS', qty: 50, taxableVal: '₹5,00,000', cgst: '₹45,000', sgst: '₹45,000', igst: '₹0' },
        { hsnCode: '8471', desc: 'Computers & Laptops', uqc: 'NOS', qty: 25, taxableVal: '₹10,00,000', cgst: '₹90,000', sgst: '₹90,000', igst: '₹0' }
      ]
    };
    sendMockData(res, { summaries });
  } catch (error) { next(error); }
};

module.exports = {
  getGstPurchaseReport,
  getGstSalesReport,
  getGstReconciliation,
  getTaxAnalysis
};
