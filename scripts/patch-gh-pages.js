const fs = require('fs');
const path = require('path');

const repo = process.argv[2] || 'miturina';
const base = `/${repo}/`;

function patchManifest(file) {
  const full = path.join(__dirname, '..', file);
  const manifest = JSON.parse(fs.readFileSync(full, 'utf8'));
  manifest.id = base;
  manifest.start_url = base;
  manifest.scope = base;
  manifest.icons = manifest.icons.map(function (icon) {
    const src = icon.src.replace(/^\.\//, '');
    return Object.assign({}, icon, { src: base + src });
  });
  fs.writeFileSync(full, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Patched', file, 'with base', base);
}

patchManifest('manifest.webmanifest');
patchManifest('manifest.json');
