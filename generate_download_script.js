const fs = require('fs');

const dataRaw = fs.readFileSync('/Users/pramodwijenayake/.gemini/antigravity-ide/brain/5a5d4817-9f6b-46ff-a011-b2eb347f9100/.system_generated/steps/138/output.txt', 'utf8');
const data = JSON.parse(dataRaw);

let bashScript = `#!/bin/bash
mkdir -p Frontend/screens
mkdir -p Frontend/images

echo "Downloading screens and images..."
`;

const screensMap = {
  "6bb41e5a2086493ea844e83bc89a50aa": "1_home",
  "ed1630b8f1f840f1bd83e0ffd342f65c": "2_shop_all",
  "886e1bce54184a199de28953136ab583": "3_shopping_bag",
  "d2d8dc53991f4738a5dee9dc67ae1484": "4_product_details",
  "832c7bcfe4f6479da4cc0877fd5e6aff": "5_checkout",
  "1978adef22e647b78e191b9ae93b96d8": "6_our_story",
  "14f5a53f6b3844cd8aab3c0567588938": "7_contact_us",
  "9671ae8920204f53bfbcf700f8c43a39": "8_my_account",
  "97ef95fa82544e3a84be7af272dd8f1b": "9_my_profile",
  "503341e7613d45c1adfe73f1ad27ed26": "10_track_order",
  "d879d47c6afa4dcda8d2b33af10d08e8": "11_order_confirmed",
  "0719eceaab82413b829d92be3124fc30": "12_payment_unsuccessful",
  "e4ad38a1775c48829c9a2da9d1768aa5": "13_secure_payment",
  "d49ea03186b746968a3caf4c5351c9b2": "14_page_not_found",
  "03301b3685924869b3f7e1bacc5f2db7": "15_login",
  "b98d5a2d0c3846f483b1598739270538": "16_join_the_magic"
};

data.screens.forEach(screen => {
  const id = screen.name.split('/').pop();
  const title = screen.title;
  let filenamePrefix = screensMap[id] || id;

  if (screen.htmlCode && screen.htmlCode.downloadUrl) {
    bashScript += `echo "Downloading HTML for ${title}..."\n`;
    bashScript += `curl -L "${screen.htmlCode.downloadUrl}" -o "Frontend/screens/${filenamePrefix}.html"\n`;
  }
  
  if (screen.screenshot && screen.screenshot.downloadUrl) {
    bashScript += `echo "Downloading Image for ${title}..."\n`;
    bashScript += `curl -L "${screen.screenshot.downloadUrl}" -o "Frontend/images/${filenamePrefix}.jpg"\n`;
  }
});

bashScript += `echo "Download complete!"\n`;

fs.writeFileSync('/Users/pramodwijenayake/Desktop/Malmalee-Creations/download_screens.sh', bashScript);
console.log('Script generated at /Users/pramodwijenayake/Desktop/Malmalee-Creations/download_screens.sh');
