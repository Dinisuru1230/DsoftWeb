const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = "AQ.Ab8RN6LCvLur0a35BZ-kO6KQSsmTQ2BWiSwZ5OTbg-JUfrUVfA";
const PROJECT_ID = "17969652875602926501";
const MCP_URL = new URL("https://stitch.googleapis.com/mcp");

const targetImages = [
  "fc63a826d569449dab41e0f2eea38d43",
  "8a1ea623e3df42e9a5fb9247a30548f0",
  "c95c497df60b4854b9df020d1c5e3f9b",
  "e1607f2e51744f49aef5b69c200e035d"
];

const imageNames = {
  "fc63a826d569449dab41e0f2eea38d43": "17_woven_floral_headband",
  "8a1ea623e3df42e9a5fb9247a30548f0": "18_silk_scrunchie",
  "c95c497df60b4854b9df020d1c5e3f9b": "19_woman_low_bun_ribbon",
  "e1607f2e51744f49aef5b69c200e035d": "20_flat_lay_ribbon_jasmine"
};

async function sendMcpRequest(method, params) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: "2.0", id: Date.now(), method: method, params: params
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
  const assetsDir = path.join(__dirname, 'Frontend', 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  console.log("Fetching images list from Stitch MCP...");
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
    if (targetImages.includes(id)) {
      const filePrefix = imageNames[id] || id;
      
      console.log(`\nFound Image: ${filePrefix}`);
      
      if (screen.screenshot && screen.screenshot.downloadUrl) {
        console.log(` -> Downloading High-Res Image...`);
        await downloadFile(screen.screenshot.downloadUrl, path.join(assetsDir, `${filePrefix}.jpg`));
      } else {
        console.log(` -> No image URL found for this ID.`);
      }
    }
  }
  console.log("\nAll requested images downloaded successfully to Frontend/assets!");
}

run().catch(console.error);
