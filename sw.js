// Service Worker for PWA Offline Capabilities
// Strategy: Network-first (always tries fresh from server, falls back to cache if offline)
const CACHE_NAME = 'packing-app-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './logo.jpg'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // Network-first strategy: always try to get fresh files from server.
  // Falls back to cache only when offline.
  evt.respondWith(
    fetch(evt.request)
      .then((networkRes) => {
        // Update the cache with the fresh response
        const cloned = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, cloned));
        return networkRes;
      })
      .catch(() => {
        // Offline fallback: serve from cache
        return caches.match(evt.request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
