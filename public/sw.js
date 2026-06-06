const CACHE_NAME = "events-hub-v1";
const OFFLINE_ASSETS = ["/", "/css/app.css", "/js/app.js", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).catch(() => caches.match("/"));
    })
  );
});
