// Service Worker for 0ms Instant Loading & Offline PWA Capabilities
const CACHE_NAME = 'packing-app-cache-v2';
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
  // Cache-first strategy for instant loading
  evt.respondWith(
    caches.match(evt.request).then((cachedRes) => {
      return cachedRes || fetch(evt.request).then((networkRes) => {
        return networkRes;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
