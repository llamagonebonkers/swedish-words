const CACHE_NAME = 'svenska-ord-v26';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=26',
  './telemetry.js?v=26',
  './app.js?v=26',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          ASSETS.map((asset) => {
            // Bypass browser/GitHub Pages 10-min HTTP cache for unversioned shell files
            const isVersioned = asset.includes('?v=');
            const req = new Request(asset, { cache: isVersioned ? 'default' : 'reload' });
            return fetch(req).then((res) => {
              if (!res.ok) throw new Error(`Precache failed for ${asset}: ${res.status}`);
              return cache.put(asset, res);
            });
          })
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML navigations: Network-first with 1.5s AbortController timeout -> canonical cached index.html
  if (request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetchWithTimeout(request, 1500)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              cache.put('./index.html', response.clone());
              cache.put('./', response.clone());
            }
            return response;
          })
          .catch(() => cache.match('./index.html').then((cached) => cached || cache.match('./')))
      )
    );
    return;
  }

  // Versioned static assets (?v=26, icons, manifest): Cache-first for 0ms startup
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => new Response('', { status: 503, statusText: 'Offline' }));
      })
    )
  );
});
