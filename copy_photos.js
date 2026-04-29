const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'special events html', 'photos');
const destDir = path.join(__dirname, 'public', 'special-events');

// Ensure dest exists
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
files.sort();

files.forEach((f, i) => {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, `photo_${i + 1}.jpg`);
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${f} -> photo_${i + 1}.jpg (${(fs.statSync(src).size / 1024).toFixed(0)} KB)`);
});

console.log(`\nDone! Copied ${files.length} photos to public/special-events/`);
