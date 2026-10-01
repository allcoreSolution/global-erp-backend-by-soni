const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Sale",
    url: `${baseUrl}/sales`,
    method: "POST",
    data: [
      { invoiceNo: "INV-1002", orderItems: [{ product: "6aa8f2e4a24351daffd49da7", quantity: 1, netUnitPrice: 100 }] }
    ]
  },
  {
    name: "Purchase",
    url: `${baseUrl}/purchases`,
    method: "POST",
    data: [
      { purchaseDate: "2026-09-15", warehouse: "Main Warehouse", name: "Purch1", code: "P-1001", orderItems: [{ product: "6aa8f2e4a24351daffd49da7", quantity: 1, purchasePrice: 50 }] }
    ]
  },
  {
    name: "Statutory (GET)",
    url: `${baseUrl}/statutory/pf-esi`,
    method: "GET",
    data: [ null ]
  }
];

// Execute curl using curl.exe
for (const api of apis) {
  console.log(`\nTesting API: ${api.name}`);
  for (let i = 0; i < api.data.length; i++) {
    let cmd = "";
    if (api.method === "POST") {
      const payload = JSON.stringify(api.data[i]).replace(/"/g, '\\"');
      cmd = `curl.exe -s -X POST "${api.url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "${payload}"`;
    } else {
      cmd = `curl.exe -s -X GET "${api.url}" -H "Authorization: Bearer ${token}"`;
    }
    
    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      // truncate output for readability
      console.log(`Response: ${output.substring(0, 150)}...`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}
