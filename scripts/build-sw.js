const fs = require('fs');
const path = require('path');

const site = (process.env.SITE_URL || 'https://aalonso008.github.io').replace(/\/$/, '');
const scopePath = new URL(site + '/').pathname;

const sw = `const CACHE = 'tu-rutina-v12';
const SCOPE = '${scopePath}';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
`;

fs.writeFileSync(path.join(__dirname, '..', 'sw.js'), sw);
console.log('Service worker generado con scope', scopePath);
