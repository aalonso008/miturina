const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = path.join(root, 'assets', 'icon.png');
const iconsDir = path.join(root, 'assets', 'icons');
const bg = { r: 15, g: 15, b: 15, alpha: 1 };

if (!fs.existsSync(source)) {
  console.error('Falta assets/icon.png');
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

const pngOpts = { compressionLevel: 9, palette: true };

Promise.all([
  sharp(source).resize(192, 192).png(pngOpts).toFile(path.join(iconsDir, 'icon-192.png')),
  sharp(source).resize(512, 512).png(pngOpts).toFile(path.join(iconsDir, 'icon-512.png')),
  sharp(source)
    .resize(410, 410, { fit: 'contain', background: bg })
    .extend({ top: 51, bottom: 51, left: 51, right: 51, background: bg })
    .png(pngOpts)
    .toFile(path.join(iconsDir, 'icon-maskable-512.png')),
  sharp(source).resize(180, 180).png(pngOpts).toFile(path.join(root, 'assets', 'apple-touch-icon.png')),
]).then(() => console.log('Iconos generados en assets/'));
