/* SMM Vault service worker - full offline support with immediate updates.

   Strategy: NETWORK-FIRST, cache as offline fallback.
   A cache-first worker would keep serving a stale bundle forever after a
   deploy (that is exactly how the broken build survived a redeploy), so
   every launch checks the network first and only falls back to cache when
   offline. Updates land on the next open. */
var CACHE = "smmvault-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./robots.txt",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        // Keep the cache fresh with whatever we just downloaded
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      })
      .catch(function () {
        // Offline: fall back to cache, then to the app shell
        return caches.match(e.request).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
  );
});