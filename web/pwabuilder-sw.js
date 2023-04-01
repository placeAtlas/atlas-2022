// This is the "Offline copy of assets" service worker

const QUEUE_NAME = "bgSyncQueue";

importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@6.5.4/build/workbox-sw.js');

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(
    ({ url }) => !url.pathname.startsWith('/_img/canvas/'),
    new workbox.strategies.NetworkFirst({
        cacheName: "main",
        plugins: [
            new workbox.backgroundSync.BackgroundSyncPlugin(
                QUEUE_NAME, {
                    maxRetentionTime: 24 * 60 
                    // Retry for max of 24 Hours (specified in minutes)
                }
            )
        ]
    })
);

workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/_img/canvas/'),
    new workbox.strategies.CacheFirst({
        cacheName: "canvas",
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 
                // Expire on 7 days (specified in minutes)
            })
        ]
    })
);