const CACHE_NAME = "lifemed-v2";

// Install — only cache static assets, NOT HTML pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/manifest.json", "/icon.svg"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first — never serve stale HTML/CSS without network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Let Next.js handle all app assets and pages normally
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    event.request.mode === "navigate"
  ) {
    return;
  }

  // Cache only icons/manifest offline
  if (url.pathname === "/manifest.json" || url.pathname === "/icon.svg") {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
