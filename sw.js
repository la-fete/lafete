// ===== إجازات مرشحة زفتى - Service Worker =====
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

var CACHE = 'ezzat-zifta-v2';
var URLS = ['.', 'index.html'];

// إعدادات مشروع Firebase (zeft-notifications — متطابقة مع GAS backend)
const firebaseConfig = {
  apiKey: "AIzaSyDmopMyvmaGH9OvaHmoNVwk_oUg9eySgBc",
  authDomain: "zeft-notifications.firebaseapp.com",
  projectId: "zeft-notifications",
  storageBucket: "zeft-notifications.firebasestorage.app",
  messagingSenderId: "96227647786",
  appId: "1:96227647786:web:ae4cf7c1d1aa7b7036fe53"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 2. إدارة التخزين المؤقت (Cache Lifecycle)
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

// 3. استراتيجية جلب البيانات والـ Offline Mode
self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('firebase') || e.request.url.includes('script.google')) return;
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

// 4. معالجة إشعارات Firebase في الخلفية
messaging.onBackgroundMessage(function(payload) {
  var title = payload.notification?.title || 'إجازات مرشحة زفتى';
  var body = payload.notification?.body || 'لديك إشعار جديد';
  var targetUrl = payload.data?.url || '/';
  var notificationOptions = {
    body: body,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: targetUrl }
  };
  return self.registration.showNotification(title, notificationOptions);
});

// 5. إدارة حدث الضغط على الإشعار
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({type:'window'}).then(function(list) {
      for (var c of list) { if (c.url.includes(self.location.host) && 'focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
