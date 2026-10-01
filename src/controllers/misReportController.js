const sendMockData = (res, data) => res.json({ success: true, data });

const getBusinessAnalysis = async (req, res, next) => {
  try {
    const data = {
      topCustomers: [
        { name: 'Aditya Enterprises', totalSales: '₹14,20,000', salesQty: 840, outstanding: '₹120,000' },
        { name: 'Vikas Trading', totalSales: '₹9,80,000', salesQty: 520, outstanding: '₹45,000' }
      ],
      topProducts: [
        { name: 'Premium Steel Sheet', category: 'Metals', salesVal: '₹15,60,000', margin: '24%' },
        { name: 'Heavy Duty Gear Box', category: 'Mechanical', salesVal: '₹11,20,000', margin: '31%' }
      ],
      fastMoving: [
        { name: 'Solder Wire 1mm', stockSpeed: 'Highly Active', monthlyTurnover: '4.8x', stockAge: '8 Days' }
      ],
      slowMoving: [
        { name: 'Heavy Duty Gear Box 10HP', stockSpeed: 'Stagnant', monthlyTurnover: '0.4x', stockAge: '110 Days' }
      ],
      lowStock: [
        { name: 'Pneumatic Actuator', currentQty: '5 units', minQty: '15 units', code: 'PROD-2204' }
      ],
      monthlySummary: [
        { month: 'Apr', rev: '₹14.50 L', exp: '₹13.10 L', profit: '₹1.40 L', customers: 1104 },
        { month: 'May', rev: '₹18.20 L', exp: '₹14.00 L', profit: '₹4.20 L', customers: 1240 },
        { month: 'Jun', rev: '₹22.10 L', exp: '₹15.50 L', profit: '₹6.60 L', customers: 1390 }
      ],
      yearComparison: [
        { year: 'FY 2024-25', rev: '₹133.00 L', profit: '₹11.30 L', margin: '34.2%', YoY: '+14.2%' },
        { year: 'FY 2025-26 (Est)', rev: '₹185.00 L', profit: '₹22.50 L', margin: '38.5%', YoY: '+39.0%' }
      ],
      outstanding: {
        netStatus: 'Healthy',
        receivables: '₹28,50,000',
        payables: '₹14,20,000',
        ageingBreakdown: [
          { bucket: '0-30 Days', amount: '₹12,00,000' },
          { bucket: '31-60 Days', amount: '₹8,50,000' },
          { bucket: '61-90 Days', amount: '₹5,00,000' },
          { bucket: '>90 Days', amount: '₹3,00,000' }
        ]
      }
    };
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getKpiReports = async (req, res, next) => {
  try {
    const data = {
      kpiList: [
        { iconName: 'ShoppingCart', name: 'Sales Revenue', value: '₹145.5 L', target: '₹150 L', pct: 97, color: 'bg-blue-50 text-blue-600 border-blue-200', status: 'On Track' },
        { iconName: 'Wallet', name: 'Operating Expenses', value: '₹42.3 L', target: '₹45 L', pct: 94, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', status: 'Controlled' },
        { iconName: 'TrendingUp', name: 'Net Profit Margin', value: '18.4%', target: '20%', pct: 92, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', status: 'On Track' },
        { iconName: 'ShoppingBag', name: 'Purchase Volume', value: '₹88.2 L', target: '₹95 L', pct: 92, color: 'bg-rose-50 text-rose-600 border-rose-200', status: 'Optimal' },
        { iconName: 'Package', name: 'Inventory Turnover', value: '4.2x', target: '5.0x', pct: 84, color: 'bg-amber-50 text-amber-600 border-amber-200', status: 'Warning' },
        { iconName: 'Landmark', name: 'Cash Flow', value: '₹12.5 L', target: '₹10 L', pct: 125, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', status: 'Optimal' }
      ],
      monthlySummary: [
        { month: 'Apr', rev: '₹14.50 L', exp: '₹13.10 L', profit: '₹1.40 L', customers: 1104 },
        { month: 'May', rev: '₹18.20 L', exp: '₹14.00 L', profit: '₹4.20 L', customers: 1240 },
        { month: 'Jun', rev: '₹22.10 L', exp: '₹15.50 L', profit: '₹6.60 L', customers: 1390 }
      ],
      yearComparison: [
        { year: 'FY 2024-25', rev: '₹133.00 L', profit: '₹11.30 L', margin: '34.2%', YoY: '+14.2%' },
        { year: 'FY 2025-26 (Est)', rev: '₹185.00 L', profit: '₹22.50 L', margin: '38.5%', YoY: '+39.0%' }
      ]
    };
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getManagementDashboard = async (req, res, next) => {
  try {
    const data = {
      summaries: {
        sales: {
          total: '₹45,20,000', mtd: '₹4,50,000', transactions: '142', growth: '+12%',
          data: [{ label: 'Highest Sale', val: '₹4,20,000' }, { label: 'Avg Ticket', val: '₹31,830' }]
        },
        purchase: {
          total: '₹32,10,000', mtd: '₹3,20,000', orders: '98', growth: '+8%',
          data: [{ label: 'Highest Bill', val: '₹5,10,000' }, { label: 'Avg Order', val: '₹32,755' }]
        },
        profit: {
          total: '₹14,20,000', margin: '31.4%', growth: '+15%',
          data: [{ label: 'Operating Profit', val: '₹18,50,000' }, { label: 'Taxes', val: '₹4,30,000' }]
        },
        expense: {
          total: '₹8,40,000', opex: '₹6,10,000', capex: '₹2,30,000', growth: '2.5%',
          data: [{ label: 'Salary', val: '₹4,20,000' }, { label: 'Rent', val: '₹1,50,000' }]
        },
        cashBank: {
          total: '₹18,50,000', bank: '₹16,20,000', cash: '₹2,30,000',
          data: [{ label: 'HDFC Bank', val: '₹10,50,000' }, { label: 'SBI Bank', val: '₹5,70,000' }]
        },
        receivablesPayables: {
          receivable: '₹42,10,000', payable: '₹28,50,000',
          data: [{ label: 'Overdue Receivable', val: '₹12,40,000' }, { label: 'Overdue Payable', val: '₹8,10,000' }]
        },
        stock: {
          totalValue: '₹54,20,000', totalQty: '14,520', alerts: '12 Items Below Min Level',
          data: [{ label: 'Fast Moving', val: '320 Items' }, { label: 'Stagnant', val: '45 Items' }]
        }
      }
    };
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getPerformanceAnalysis = async (req, res, next) => {
  try {
    const data = {
      salesVsTarget: { target: 5000000, achieved: 4520000, pct: 90.4, growth: '+12.5%' },
      purchaseVsTarget: { budget: 3500000, spent: 3150000, pct: 90.0, savings: '₹3,50,000' },
      margins: [
        { title: 'Gross Profit Margin', value: '38.4%', target: '40.0%', status: 'Optimal' },
        { title: 'Net Profit Margin', value: '14.2%', target: '15.0%', status: 'Warning' }
      ],
      branchPerf: [
        { name: 'Mumbai HO', target: '₹18.0 L', achieved: '₹18.4 L', status: 'Exceeded', pct: 105 },
        { name: 'Pune Branch', target: '₹12.0 L', achieved: '₹10.5 L', status: 'Below Target', pct: 87 }
      ],
      deptPerf: [
        { name: 'Sales & Distribution', efficiency: '94%', lead: 'Priya Patel' },
        { name: 'Procurement', efficiency: '88%', lead: 'Rajesh Kumar' }
      ],
      employeePerf: [
        { name: 'Amit Sharma', role: 'Account Lead', score: '9.4/10', rate: 'Outstanding' },
        { name: 'Neha Gupta', role: 'Support Exec', score: '8.2/10', rate: 'Good' }
      ],
      salespersonPerf: [
        { name: 'Vikram Singh', target: '₹13.0 L', achieved: '₹13.4 L', commission: '₹1,17,000', rating: 4.9 },
        { name: 'Sanjay Dutt', target: '₹10.0 L', achieved: '₹8.5 L', commission: '₹65,000', rating: 3.8 }
      ]
    };
    sendMockData(res, data);
  } catch (error) { next(error); }
};

module.exports = {
  getBusinessAnalysis,
  getKpiReports,
  getManagementDashboard,
  getPerformanceAnalysis
};
