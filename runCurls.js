const { execSync } = require('child_process');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTc4YWViODliOTAzZmY3MzAxOGMyMiIsInJvbGUiOiJTdXBlckFkbWluIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3ODk0NTY5MDEsImV4cCI6MTc5MjA0ODkwMX0.w29pkNSCEH1VR-Ao--vsWO-EcdBuKZh0whcJr7ppClw";
const baseUrl = "http://localhost:5000/api";

const apis = [
  {
    name: "Department",
    url: `${baseUrl}/departments`,
    data: [
      { name: "IT Department", code: "IT-01", description: "Information Technology" },
      { name: "HR Department", code: "HR-01", description: "Human Resources" }
    ]
  },
  {
    name: "Designation",
    url: `${baseUrl}/designations`,
    data: [
      { title: "Software Engineer", code: "SE-01", level: "L1" },
      { title: "HR Manager", code: "HRM-01", level: "L2" }
    ]
  },
  {
    name: "Holiday",
    url: `${baseUrl}/holidays`,
    data: [
      { name: "New Year", date: "2027-01-01", type: "Public" },
      { name: "Christmas", date: "2027-12-25", type: "Public" }
    ]
  },
  {
    name: "Tax Slab",
    url: `${baseUrl}/tax-slabs`,
    data: [
      { name: "GST 18%", percentage: 18, description: "Standard GST" },
      { name: "GST 5%", percentage: 5, description: "Low GST" }
    ]
  },
  {
    name: "Unit",
    url: `${baseUrl}/units`,
    data: [
      { unitCode: "KG", unitName: "Kilogram", baseUnit: "None" },
      { unitCode: "PCS", unitName: "Pieces", baseUnit: "None" }
    ]
  }
];

// Execute curl using curl.exe to avoid powershell alias issues
for (const api of apis) {
  console.log(`\nTesting API: ${api.name}`);
  for (let i = 0; i < api.data.length; i++) {
    const payload = JSON.stringify(api.data[i]).replace(/"/g, '\\"');
    const cmd = `curl.exe -s -X POST "${api.url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "${payload}"`;
    try {
      console.log(`Running curl for item ${i + 1}...`);
      const output = execSync(cmd, { encoding: 'utf-8' });
      console.log(`Response: ${output}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}
