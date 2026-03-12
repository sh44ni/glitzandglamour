// Copy icons into Android mipmap folders at the right densities
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputIcon = path.join(__dirname, '../public/favicon-glitz.png');
const resDir = path.join(__dirname, '../android/app/src/main/res');

const densities = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateAndroidIcons() {
  for (const { folder, size } of densities) {
    const outDir = path.join(resDir, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    await sharp(inputIcon).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher.png'));
    await sharp(inputIcon).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_round.png'));
    await sharp(inputIcon).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_foreground.png'));
    console.log(`✅ ${folder} (${size}x${size})`);
  }
  console.log('\nAll Android icons generated!');
}

generateAndroidIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
