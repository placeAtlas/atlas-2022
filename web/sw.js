importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@6.5.4/build/workbox-sw.js');

self.addEventListener("message", event => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(
    ({ url }) => !url.pathname.startsWith('/_img/canvas/'),
    // `workbox.strategies.StaleWhileRevalidate` is used to reduce server contact.
    // Change to `workbox.strategies.NetworkFirst` when updating is required. 
    new workbox.strategies.NetworkFirst({
        cacheName: "main",
        plugins: [
            new workbox.backgroundSync.BackgroundSyncPlugin(
                "main-queue", {
                    maxRetentionTime: 4 * 7 * 24 * 60 // 4 weeks (in minutes)
                }
            )
        ]
    })
);

workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/_img/canvas/'),
    // `workbox.strategies.CacheFirst` is used to minimize server contact, due to their size.
    // Change to `workbox.strategies.StateWhileRevalidate` when updating is required. 
    new workbox.strategies.CacheFirst({
        cacheName: "canvas"
    })
);