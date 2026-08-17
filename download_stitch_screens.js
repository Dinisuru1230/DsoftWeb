const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = "AQ.Ab8RN6LCvLur0a35BZ-kO6KQSsmTQ2BWiSwZ5OTbg-JUfrUVfA";
const PROJECT_ID = "17969652875602926501";
const MCP_URL = new URL("https://stitch.googleapis.com/mcp");

const targetScreens = [
  "82d8ad0653734a8bb2aff26e532202db", // Add New Product | Admin
  "06d4c0c1888947f3949e4f8b1ea7c251", // Order Details | Admin
  "60bc7c63d5c14d53bde77d9ee39819cf", // Customer Management | Admin
  "17a4b338f1334db7a6ec04d318461f0c", // Order Management | Admin
  "6c592151fa134a808e46e77a65088621", // Category Management | Admin
  "08451a442e3b4b13bc6dcb2d159415dd", // Product Management | Admin
  "5fd69d51594c45c89ea15f2d77fcc144"  // Admin Dashboard
];

const screenNames = {
  "82d8ad0653734a8bb2aff26e532202db": "admin_01_add_product",
  "06d4c0c1888947f3949e4f8b1ea7c251": "admin_02_order_details",
  "60bc7c63d5c14d53bde77d9ee39819cf": "admin_03_customer_management",
  "17a4b338f1334db7a6ec04d318461f0c": "admin_04_order_management",
  "6c592151fa134a808e46e77a65088621": "admin_05_category_management",
  "08451a442e3b4b13bc6dcb2d159415dd": "admin_06_product_management",
  "5fd69d51594c45c89ea15f2d77fcc144": "admin_07_dashboard"
};

async function sendMcpRequest(method, params) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: "2.0", id: 1, method: method, params: params
    });
    const options = {
      hostname: MCP_URL.hostname, port: 443, path: MCP_URL.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function run() {
  const screensDir = path.join(__dirname, 'Frontend', 'admin-screens');
  const imagesDir = path.join(__dirname, 'Frontend', 'admin-images');
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  console.log("Fetching screen list from Stitch MCP...");
  const listRes = await sendMcpRequest("tools/call", {
    name: "list_screens",
    arguments: { projectId: PROJECT_ID }
  });

  if (!listRes.result || !listRes.result.content) {
    console.error("Failed to list screens:", listRes);
    return;
  }

  const screensData = JSON.parse(listRes.result.content[0].text);
  
  for (const screen of screensData.screens) {
    const id = screen.name.split('/').pop();
    if (targetScreens.includes(id)) {
      const title = screen.title;
      const filePrefix = screenNames[id] || id;
      
      console.log(`\nFound Screen: ${title} (${id})`);
      
      if (screen.htmlCode && screen.htmlCode.downloadUrl) {
        console.log(` -> Downloading HTML...`);
        await downloadFile(screen.htmlCode.downloadUrl, path.join(screensDir, `${filePrefix}.html`));
      }
      if (screen.screenshot && screen.screenshot.downloadUrl) {
        console.log(` -> Downloading Screenshot...`);
        await downloadFile(screen.screenshot.downloadUrl, path.join(imagesDir, `${filePrefix}.jpg`));
      }
    }
  }
  console.log("\nAll requested screens downloaded successfully!");
}

run().catch(console.error);
