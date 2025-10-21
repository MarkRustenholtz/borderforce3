const CACHE_NAME = 'cr-gendarmerie-cache-v33'; // ⚠️ change le numéro à chaque mise à jour
const urlsToCache = [
  './',
  './index.html',
  './pv/index.html',
  './icon-192.png',
  './icon-512.png',
   './libs/html5-qrcode.min.js',
  './libs/html2pdf.bundle.min.js'
];

// Installation : on met en cache les fichiers de base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch : réseau d’abord, cache en secours
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // si la requête réussit, on met à jour le cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // si échec réseau → on retourne le cache
        return caches.match(event.request).then(response => {
          if (response) return response;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
// 🔁 Écoute du message 'skipWaiting' depuis la page
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

