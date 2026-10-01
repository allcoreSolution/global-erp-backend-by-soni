const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Shift Setup",
    url: `${baseUrl}/shift-setups`,
    data: [
      { shiftCode: "SH-M", shiftName: "Morning Shift" },
      { shiftCode: "SH-E", shiftName: "Evening Shift" }
    ]
  },
  {
    name: "Price Rule",
    url: `${baseUrl}/price-rules`,
    data: [
      { id: "PR-01", name: "Summer Discount" },
      { id: "PR-02", name: "Winter Sale" }
    ]
  },
  {
    name: "Price List",
    url: `${baseUrl}/price-lists`,
    data: [
      { id: "PL-01", name: "Retail Price List" },
      { id: "PL-02", name: "Wholesale Price List" }
    ]
  },
  {
    name: "Gift Card",
    url: `${baseUrl}/gift-cards`,
    data: [
      { cardNo: "GC-1001", amount: 500 },
      { cardNo: "GC-1002", amount: 1000 }
    ]
  },
  {
    name: "Courier",
    url: `${baseUrl}/couriers`,
    data: [
      { courierCode: "CR-01", name: "BlueDart", phone: "9876543210" },
      { courierCode: "CR-02", name: "Delhivery", phone: "9876543211" }
    ]
  },
  {
    name: "Employee Target",
    url: `${baseUrl}/employee-targets`,
    data: [
      { targetNo: "TGT-01", targetName: "Q1 Sales" },
      { targetNo: "TGT-02", targetName: "Q2 Marketing" }
    ]
  },
  {
    name: "Leave Request",
    url: `${baseUrl}/leave-requests`,
    data: [
      { employeeName: "John Doe", leaveType: "Sick Leave", startDate: "2026-10-01", endDate: "2026-10-02" },
      { employeeName: "Jane Smith", leaveType: "Casual Leave", startDate: "2026-11-05", endDate: "2026-11-06" }
    ]
  },
  {
    name: "Salary Structure",
    url: `${baseUrl}/salary-structures`,
    data: [
      { code: "SS-01", name: "Basic Plan", component: "Basic", type: "Fixed", amount: 15000 },
      { code: "SS-02", name: "Premium Plan", component: "HRA", type: "Fixed", amount: 8000 }
    ]
  },
  {
    name: "HSN Mapping",
    url: `${baseUrl}/hsn-mappings`,
    data: [
      { id: "HSN-01", hsnCode: "8517" },
      { id: "HSN-02", hsnCode: "8471" }
    ]
  },
  {
    name: "Account Ledger",
    url: `${baseUrl}/account-ledgers`,
    data: [
      { accountName: "Cash Account", group: "Current Assets" },
      { accountName: "Bank Account", group: "Current Assets" }
    ]
  }
];

// Execute curl using curl.exe
for (const api of apis) {
  console.log(`\nTesting API: ${api.name}`);
  for (let i = 0; i < api.data.length; i++) {
    const payload = JSON.stringify(api.data[i]).replace(/"/g, '\\"');
    const cmd = `curl.exe -s -X POST "${api.url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "${payload}"`;
    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      // truncate output for readability
      console.log(`Response: ${output.substring(0, 150)}...`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}
