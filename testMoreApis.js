const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Customer",
    url: `${baseUrl}/customers`,
    data: [
      { customerCode: "CUST-001", name: "Reliance Industries" },
      { customerCode: "CUST-002", name: "Tata Motors" }
    ]
  },
  {
    name: "Branch",
    url: `${baseUrl}/branches`,
    data: [
      { id: "BR-001", name: "Mumbai Branch" },
      { id: "BR-002", name: "Delhi Branch" }
    ]
  },
  {
    name: "Role",
    url: `${baseUrl}/roles`,
    data: [
      { name: "Manager", permissions: ["view_reports"] },
      { name: "Cashier", permissions: ["create_sales"] }
    ]
  },
  {
    name: "Brand",
    url: `${baseUrl}/products/brands`, // need to check exact routes if this fails
    data: [
      { name: "Samsung" },
      { name: "Apple" }
    ]
  },
  {
    name: "Category",
    url: `${baseUrl}/products/categories`,
    data: [
      { name: "Electronics" },
      { name: "Home Appliances" }
    ]
  },
  {
    name: "Product",
    url: `${baseUrl}/products`,
    data: [
      { productName: "iPhone 15", productCode: "IP15" },
      { productName: "Galaxy S23", productCode: "GS23" }
    ]
  },
  {
    name: "Clearance",
    url: `${baseUrl}/clearances`,
    data: [
      { clearanceNo: "CLR-01", amount: 5000 },
      { clearanceNo: "CLR-02", amount: 10000 }
    ]
  },
  {
    name: "Contra Entry",
    url: `${baseUrl}/contra-entries`,
    data: [
      { entryNo: "CE-01", amount: 2000 },
      { entryNo: "CE-02", amount: 3000 }
    ]
  },
  {
    name: "Journal Voucher",
    url: `${baseUrl}/journal-vouchers`,
    data: [
      { voucherNo: "JV-01", totalAmount: 1500 },
      { voucherNo: "JV-02", totalAmount: 2500 }
    ]
  },
  {
    name: "Bank Payment",
    url: `${baseUrl}/payments`,
    data: [
      { paymentNo: "PAY-01", amount: 400 },
      { paymentNo: "PAY-02", amount: 800 }
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
