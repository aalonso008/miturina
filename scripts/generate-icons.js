const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = path.join(root, 'assets', 'icon.png');
const iconsDir = path.join(root, 'assets', 'icons');

if (!fs.existsSync(source)) {
  console.error('Falta assets/icon.png');
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

Promise.all([
  sharp(source).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png')),
  sharp(source).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png')),
  sharp(source).resize(180, 180).png().toFile(path.join(root, 'assets', 'apple-touch-icon.png')),
]).then(() => console.log('Íconos generados en assets/'));
