// ✅ service-worker.js

const CACHE_NAME = 'offline-cache-v1';

const urlsToCache = [
  '/chat.css',
  '/chat.js',
  '/discord.html',
  '/extra.css',
  '/extra.js',
  '/game-results.html',
  '/index.html',
  '/node.js',
  '/results.js',
  '/script.js',
  '/style.css',
  '/vapid-keys.env',
  '/whack-a-yuuka-weasel.html',
  '/yuuka-math.html',
  '/IMG_6281.ico'
];


// =====================================================
// 📦 INSTALL
// =====================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources...');

        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installation complete! ✅');

        // Activate the new SW immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          '[SW] Installation failed:',
          error
        );
      })
  );
});


// =====================================================
// 🔄 ACTIVATE
// =====================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');

  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log(
                '[SW] 🧹 Removing old cache:',
                key
              );

              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete! ✅');

        // Take control of existing pages immediately
        return self.clients.claim();
      })
  );
});


// =====================================================
// 🌐 FETCH
// =====================================================

// Network first for HTML / JS / CSS.
// This prevents stale code from surviving normal reloads.

self.addEventListener('fetch', (event) => {

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {

        // Only cache complete successful responses.
        // HTTP 206 Partial Content cannot be stored in Cache API.
        if (
          networkResponse.ok &&
          networkResponse.status === 200
        ) {
          const responseClone =
            networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.put(
                event.request,
                responseClone
              );
            })
            .catch((error) => {
              console.warn(
                '[SW] ⚠️ Cache update failed:',
                error
              );
            });
        }

        return networkResponse;
      })
      .catch(() => {

        // Network failed → use cached copy
        return caches.match(event.request)
          .then((cachedResponse) => {

            if (cachedResponse) {
              console.log(
                '[SW] 📦 Serving cached:',
                event.request.url
              );

              return cachedResponse;
            }

            // Final fallback
            return caches.match('/index.html');
          });
      })
  );
});


// =====================================================
// 📱 PUSH NOTIFICATIONS
// =====================================================

self.addEventListener('push', (event) => {
    console.log(
        '[SW] 📲 Push notification received'
    );

    let data = {};

    try {
        data = event.data
            ? event.data.json()
            : {};
    } catch (error) {
        console.error(
            '[SW] ❌ Failed to parse push data:',
            error
        );
    }

    const title =
        data.title ||
        'Hayase Yuuka Chat';

    const icon =
        data.icon ||
        new URL(
            'IMG_6281.JPG',
            self.location.origin + '/'
        ).href;

    const badge =
        data.badge ||
        icon;

    const options = {
        body:
            data.body ||
            'You have a new message!',

        icon,
        badge,

        tag:
            data.tag ||
            'chat-notification',

        renotify: true,

        requireInteraction: false,

        vibrate: [
            200,
            100,
            200
        ],

        actions: [
            {
                action: 'mark-read',
                title: 'Mark as read'
            },
            {
                action: 'reply',
                title: 'Reply'
            }
        ],

        data: {
            notificationId:
                data.notificationId ||
                `${Date.now()}`,

            type:
                data.type ||
                'message',

            username:
                data.username ||
                '',

            message:
                data.message ||
                data.body ||
                '',

            url:
                data.url ||
                '/',

            actionUrl:
                data.url ||
                '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});


// =====================================================
// 👆 NOTIFICATION CLICK
// =====================================================

self.addEventListener('notificationclick', (event) => {
    console.log(
        '[SW] 🔔 Notification clicked:',
        event.action || 'notification body'
    );

    const notification =
        event.notification;

    const data =
        notification.data || {};

    const action =
        event.action;

    notification.close();

    /*
     * ✅ MARK AS READ
     */
    if (action === 'mark-read') {
        console.log(
            '[SW] ✅ Notification marked as read'
        );

        event.waitUntil(
            notifyOpenClients({
                type: 'NOTIFICATION_MARK_READ',
                notificationId:
                    data.notificationId,
                username:
                    data.username,
                message:
                    data.message
            })
        );

        return;
    }

    /*
     * 💬 REPLY
     *
     * Open/focus the website and tell the
     * page to focus the chat input.
     */
    if (action === 'reply') {
        console.log(
            '[SW] 💬 Reply action selected'
        );

        event.waitUntil(
            openChatForReply(data)
        );

        return;
    }

    /*
     * 🖱️ Normal notification click
     */
    event.waitUntil(
        openChatForReply(data)
    );
});


async function openChatForReply(data) {
    const url =
        data.actionUrl ||
        data.url ||
        '/';

    const clientList =
        await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

    /*
     * If the website is already open,
     * focus it instead of opening another tab.
     */
    for (const client of clientList) {
        if ('focus' in client) {
            await client.focus();

            client.postMessage({
                type: 'OPEN_CHAT_REPLY',
                username:
                    data.username || '',
                message:
                    data.message || ''
            });

            return;
        }
    }

    /*
     * Otherwise open the website.
     */
    const newClient =
        await clients.openWindow(url);

    if (newClient) {
        /*
         * Give the page a moment to load before
         * sending the message.
         */
        setTimeout(() => {
            newClient.postMessage({
                type: 'OPEN_CHAT_REPLY',
                username:
                    data.username || '',
                message:
                    data.message || ''
            });
        }, 500);
    }
}


async function notifyOpenClients(data) {
    const clientList =
        await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

    clientList.forEach(client => {
        client.postMessage(data);
    });
}


// =====================================================
// 📱 IN-APP NOTIFICATION REQUEST
// =====================================================

self.addEventListener(
  'message',
  (event) => {

    if (!event.data) {
      return;
    }

    if (
      event.data.type ===
      'SHOW_NOTIFICATION'
    ) {

      console.log(
        '[SW] 🔔 SHOW_NOTIFICATION received:',
        event.data
      );

      const {
        title,
        options
      } = event.data;

      event.waitUntil(
        self.registration.showNotification(
          title,
          options
        )
      );
    }
  }
);