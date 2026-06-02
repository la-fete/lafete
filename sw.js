// ===== لافيت - Service Worker =====
var CACHE = 'lafitte-v1';
var URLS = ['.', 'index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(URLS); }).then(self.skipWaiting())
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(n) { if (n !== CACHE) return caches.delete(n); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('script.google')) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      var clone = r.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      return r;
    }).catch(function() {
      return caches.match(e.request).then(function(m) {
        return m || new Response('Offline', {status:503});
      });
    })
  );
});
