const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Employee",
    url: `${baseUrl}/employees`,
    data: [
      { employeeId: "EMP-1001", employeeName: "Amit Kumar" }
    ]
  },
  {
    name: "Supplier",
    url: `${baseUrl}/suppliers`,
    data: [
      { supplierCode: "SUP-01", companyName: "ABC Corp" }
    ]
  },
  {
    name: "Driver",
    url: `${baseUrl}/drivers`,
    data: [
      { driverCode: "DRV-01", driverName: "Raju" }
    ]
  },
  {
    name: "Coupon",
    url: `${baseUrl}/coupons`,
    data: [
      { couponCode: "DISC50" }
    ]
  },
  {
    name: "Stock Entry",
    url: `${baseUrl}/stock-entries`,
    data: [
      { stockNo: "SE-01", stockDate: "2026-09-15", products: [{ product: "iPhone 15" }] }
    ]
  },
  {
    name: "Sale",
    url: `${baseUrl}/sales`,
    data: [
      { invoiceNo: "INV-1001", products: [{ quantity: 1, netUnitPrice: 100 }] }
    ]
  },
  {
    name: "Purchase",
    url: `${baseUrl}/purchases`,
    data: [
      { purchaseDate: "2026-09-15", warehouse: "Main Warehouse", products: [{ name: "MacBook", code: "MB1", quantity: 1 }] }
    ]
  },
  {
    name: "Receipt",
    url: `${baseUrl}/receipts`,
    data: [
      { receiptNo: "REC-01", receiptDate: "2026-09-15", invoiceNo: "INV-1001", paymentAmount: 500 }
    ]
  },
  {
    name: "Bank Receipt",
    url: `${baseUrl}/bank-receipts`,
    data: [
      { receiptNo: "BREC-01", receiptDate: "2026-09-15", paymentAmount: 500 }
    ]
  },
  {
    name: "Statutory",
    url: `${baseUrl}/statutory`,
    data: [
      { component: "PF", type: "Deduction" }
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
