// service-worker.js

const CACHE_NAME = 'offline-cache';
const urlsToCache = [
    '/chat.css',
    '/chat.js',
    '/discord.html', // Adjust to your homepage and other files
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
    // Add other static resources you want to cache
];

// Install event to cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching resources');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event to serve cached resources when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // If cached response exists, return it, else fetch from network
                return cachedResponse || fetch(event.request);
            })
    );
});

// Activate event to clear old caches if needed
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
