const CACHE_NAME = "libro-de-caja-v1";
const APP_FILES = ["./", "./index.html", "./indice.html", "./Utiles/warehouse-aisle.jpg"];
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  try { await cache.addAll(APP_FILES); } catch {}
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response && (response.ok || response.type === "opaque")) {
        const cache = await caches.open(CACHE_NAME);
        try { await cache.put(event.request, response.clone()); } catch {}
      }
      return response;
    } catch {
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
