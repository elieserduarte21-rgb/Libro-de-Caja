const CACHE_NAME = "inventario-utiles-offline-v4";
const APP_FILES = ["./warehouse-aisle.jpg"];
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_FILES);
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith("inventario-utiles-offline-") && name !== CACHE_NAME).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || !["image", "font"].includes(request.destination)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        const cache = await caches.open(CACHE_NAME);
        try { await cache.put(request, response.clone()); } catch {}
      }
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
