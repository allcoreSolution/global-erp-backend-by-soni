const sendMockData = (res, data) => res.json({ success: true, data });

const getTdsPurchaseReport = async (req, res, next) => {
  try {
    const purchaseRecords = [
      { id: 1, supplier: 'Rajesh Transporters', sec: '194C', totalVal: 50000, tdsRate: '1%', tdsDeducted: 500, depositStatus: 'Deposited', challanNo: 'CHL987654' },
      { id: 2, supplier: 'Tech Consultants Pvt Ltd', sec: '194J', totalVal: 120000, tdsRate: '10%', tdsDeducted: 12000, depositStatus: 'Pending', challanNo: '-' },
      { id: 3, supplier: 'Metro Office Rentals', sec: '194I', totalVal: 80000, tdsRate: '10%', tdsDeducted: 8000, depositStatus: 'Deposited', challanNo: 'CHL112233' }
    ];
    sendMockData(res, { purchaseRecords });
  } catch (error) { next(error); }
};

const getTdsSalesReport = async (req, res, next) => {
  try {
    const tdsRecords = [
      { id: 1, client: 'Reliance Industries', sec: '194Q', invVal: 6000000, tdsRate: '0.1%', tdsDeducted: 6000, certStatus: 'Received', matched26as: 'Yes' },
      { id: 2, client: 'Tata Motors', sec: '194Q', invVal: 8500000, tdsRate: '0.1%', tdsDeducted: 8500, certStatus: 'Pending', matched26as: 'No' },
      { id: 3, client: 'Govt Dept (PWD)', sec: '51 (GST)', invVal: 200000, tdsRate: '2%', tdsDeducted: 4000, certStatus: 'Received', matched26as: 'Yes' }
    ];
    sendMockData(res, { tdsRecords });
  } catch (error) { next(error); }
};

const getTdsReconciliation = async (req, res, next) => {
  try {
    const reconciledItems = [
      { id: 1, entryNo: 'TDS-R-01', client: 'Reliance Industries', bookTds: 6000, as26Tds: 6000, difference: 0, status: 'Matched' },
      { id: 2, entryNo: 'TDS-R-02', client: 'Tata Motors', bookTds: 8500, as26Tds: 0, difference: 8500, status: 'Pending in 26AS' },
      { id: 3, entryNo: 'TDS-R-03', client: 'Govt Dept (PWD)', bookTds: 4000, as26Tds: 3800, difference: 200, status: 'Short Deduction' }
    ];
    const summaries = {
      reconciliation: { totalBookTds: '₹18,500', total26asTds: '₹9,800', netDifference: '₹8,700', pendingAction: 2 }
    };
    sendMockData(res, { reconciledItems, summaries });
  } catch (error) { next(error); }
};

const getTdsTaxAnalysis = async (req, res, next) => {
  try {
    const tdsSlabs = [
      { sec: 'Sec 194C (Contractors)', rate: '1% / 2%', threshold: '₹30,000 / ₹1,00,000', totalDeductions: 8000, deposited: 8000, pending: 0 },
      { sec: 'Sec 194J (Professionals)', rate: '10%', threshold: '₹30,000', totalDeductions: 25000, deposited: 15000, pending: 10000 },
      { sec: 'Sec 194I (Rent)', rate: '10%', threshold: '₹2,40,000', totalDeductions: 48000, deposited: 48000, pending: 0 },
      { sec: 'Sec 194Q (Purchase of Goods)', rate: '0.1%', threshold: '₹50 Lakhs', totalDeductions: 3200, deposited: 0, pending: 3200 }
    ];
    const totals = {
      deductions: 84200,
      deposited: 71000,
      pending: 13200
    };
    sendMockData(res, { tdsSlabs, totals });
  } catch (error) { next(error); }
};

module.exports = {
  getTdsPurchaseReport,
  getTdsSalesReport,
  getTdsReconciliation,
  getTdsTaxAnalysis
};
