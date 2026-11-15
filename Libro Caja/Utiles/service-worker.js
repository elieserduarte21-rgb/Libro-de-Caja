const CACHE_NAME = "inventario-utiles-offline-v3";
const XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
const APP_FILES = ["./", "./index.html", "./styles.css", "./app.js", "./assistant.css", "./assistant.js"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("inventario-utiles-offline-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const isAppResource = request.destination === "document" || request.destination === "script" || request.destination === "style" || request.destination === "image" || request.destination === "font";
  if (!isAppResource) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    try {
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        try { await cache.put(request, response.clone()); } catch {}
      }
      return response;
    } catch {
      if (cached) return cached;
      if (request.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});
