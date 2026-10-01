const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Clearance",
    url: `${baseUrl}/clearances`,
    data: [
      { clearanceId: "CLR-01", amountDeposited: 5000, party: "Tata", bankAccount: "HDFC" },
      { clearanceId: "CLR-02", amountDeposited: 10000, party: "Reliance", bankAccount: "SBI" }
    ]
  },
  {
    name: "Contra Entry",
    url: `${baseUrl}/contra-entries`,
    data: [
      { voucherNumber: "CE-01", amount: 2000, toAccount: "SBI", fromAccount: "HDFC", transferMode: "Cash to Bank" },
      { voucherNumber: "CE-02", amount: 3000, toAccount: "Axis", fromAccount: "SBI", transferMode: "Bank to Cash" }
    ]
  },
  {
    name: "Bank Payment",
    url: `${baseUrl}/payments`,
    data: [
      { paymentNo: "PAY-01", paymentAmount: 400, paymentDate: "2026-09-15" },
      { paymentNo: "PAY-02", paymentAmount: 800, paymentDate: "2026-09-16" }
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
