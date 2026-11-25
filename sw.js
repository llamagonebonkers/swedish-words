const CACHE_NAME = 'svenska-ord-v18';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=18',
  './app.js?v=18',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Stale-While-Revalidate: instant startup from cache, silent background refresh
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }

        return networkPromise.then((networkResponse) => {
          if (networkResponse) return networkResponse;
          if (request.mode === 'navigate') {
            return cache.match('./index.html');
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    )
  );
});
