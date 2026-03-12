// Script to generate PNG icons from the existing favicon-glitz.png
// Run with: node scripts/generate-icons.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/favicon-glitz.png');
const outputDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating app icons from favicon-glitz.png...');
  
  await sharp(inputPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'icon-192.png'));
  console.log('✅ Generated icon-192.png');

  await sharp(inputPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon-512.png'));
  console.log('✅ Generated icon-512.png');

  // Android adaptive icon foreground (1024x1024 with padding for safe zone)
  await sharp(inputPath)
    .resize(768, 768)
    .extend({ top: 128, bottom: 128, left: 128, right: 128, background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon-1024.png'));
  console.log('✅ Generated icon-1024.png (Android adaptive)');

  console.log('\nAll icons generated in public/icons/');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
