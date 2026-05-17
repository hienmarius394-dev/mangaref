// ─── MangaRef Service Worker v3 ──────────────────────────────────────
const CACHE = "mangaref-v3";
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE).catch(function() {
        return cache.addAll(["/", "/index.html", "/manifest.json"]);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  // Ne pas cacher les appels API
  if (event.request.url.includes("/api/")) return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === "error") return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(event.request, clone); });
        return response;
      }).catch(function() {
        return caches.match("/index.html");
      });
    })
  );
});
