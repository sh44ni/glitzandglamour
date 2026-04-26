const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('Special_Events_Page_V1_9_.html', 'utf8');
const outDir = path.join('public', 'special-events');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Find all base64 image sources
const regex = /src="data:image\/(jpeg|png);base64,([A-Za-z0-9+\/=]+)"/g;
let match;
let i = 0;
while ((match = regex.exec(html)) !== null) {
  i++;
  const ext = match[1] === 'jpeg' ? 'jpg' : 'png';
  const buf = Buffer.from(match[2], 'base64');
  const filename = `event_${i}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), buf);
  console.log(`Saved ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
}
console.log(`\nTotal images extracted: ${i}`);
