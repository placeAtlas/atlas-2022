// This is the "Offline copy of assets" service worker

const CACHE = "pwabuilder-offline";
const QUEUE_NAME = "bgSyncQueue";

importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@6.5.4/build/workbox-sw.min.js');

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(QUEUE_NAME, {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: CACHE,
        plugins: [
            bgSyncPlugin
        ]
    })
);