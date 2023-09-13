// This is the "Offline copy of assets" service worker

importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@6.5.4/build/workbox-sw.js');

self.addEventListener("message", event => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(
    ({ url }) => {!url.pathname.startsWith('/_img/canvas/')},
    new workbox.strategies.NetworkFirst({
        cacheName: "main",
        plugins: [
            new workbox.backgroundSync.BackgroundSyncPlugin(
                "main-queue", {
                    maxRetentionTime: 24 * 60 // 24 hours (in minutes)
                }
            )
        ]
    })
);

workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/_img/canvas/'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: "canvas",
        plugins: [
            new workbox.backgroundSync.BackgroundSyncPlugin(
                "canvas-queue", {
                    maxRetentionTime: 4 * 7 * 24 * 60 // 4 weeks (in minutes)
                }
            )
        ]
    })
);