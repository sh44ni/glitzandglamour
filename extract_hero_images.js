const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'special events html', 'Special_Events_Page_V1_9_.html'), 'utf8');
const outDir = path.join(__dirname, 'public', 'special-events');

// Find all base64 images
const regex = /src="data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)"/g;
let match;
let i = 0;
while ((match = regex.exec(html)) !== null && i < 20) {
  const ext = match[1] === 'jpeg' ? 'jpg' : 'png';
  const buf = Buffer.from(match[2], 'base64');
  const fname = `hero_ref_${i}.${ext}`;
  fs.writeFileSync(path.join(outDir, fname), buf);
  console.log(`Saved ${fname} (${(buf.length / 1024).toFixed(0)} KB)`);
  i++;
}
console.log('Total images extracted:', i);
