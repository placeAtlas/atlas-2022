const staticAtlas = "atlas-service-v1";
const assets = [
  "/",
  "/index.html",
  "/about.html",  
  "/_css/style.css",
  "/_js/atlas.js",
  "/_js/draw.js",
  "/_js/infobox.js",
  "/_js/main.js",
  "/_js/overlap.js",
  "/_js/pointInPolygon.js",
  "/_js/stats.js",
  "/_js/time.js",
  "/_js/view.js",
  "/atlas.json"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticAtlas).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
