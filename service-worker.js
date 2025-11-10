// ✅ service-worker.js

const CACHE_NAME = 'offline-cache-prototype';
const urlsToCache = [
  '/chat.css',
  '/chat.js',
  '/discord.html',
  '/extra.css',
  '/extra.js',
  '/game-results.html',
  '/hayase-yuuka-photos.html',
  '/hayase-yuuka-videos.html',
  '/index.html',
  '/results.js',
  '/script.js',
  '/style.css',
  '/whack-a-yuuka-weasel.html',
  '/yuuka-math.html',
  '/IMG_6281.ico', // 🧩 add the icon too!
];

// 🧱 INSTALL — Cache important files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[SW] Caching essential resources...');
          return cache.addAll(urlsToCache);
        })
        .then(() => console.log('[SW] Installation complete! ✅'))
        .catch((err) => console.error('[SW] Installation failed:', err))
    );
  });

  function logToPage(message) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'sw-log', message }));
    });
  }
  
  self.addEventListener('install', event => {
    logToPage('[SW] Installing...');
  });
  
  self.addEventListener('activate', event => {
    logToPage('[SW] Activated!');
  });
  
// 🧹 ACTIVATE — Remove old cache versions
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim(); // Activate immediately
});

// 🌐 FETCH — Serve cached files first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => cachedResponse || fetch(event.request))
      .catch(() => caches.match('/index.html')) // fallback to home if offline
  );
});

// 🔔 PUSH — Receive push messages (from server or FCM)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received!');
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.warn('[SW] Push event had no data');
  }

  const title = data.title || '📢 New message!';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/IMG_6281.ico',
    badge: '/IMG_6281.ico',
    tag: data.tag || 'chat-update',
    renotify: true,
    vibrate: [200, 100, 200], // subtle mobile buzz
    data: {
      url: data.url || '/', // open the chat or homepage
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 👆 NOTIFICATION CLICK — Focus or open the app
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
 