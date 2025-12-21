/* ================================
   Accountant AI — Service Worker
   SAFE for Vite + React + Lovable
   ================================ */

const CACHE_VERSION = "v3.3";

const IMAGE_CACHE = `accountant-ai-images-${CACHE_VERSION}`;
const API_CACHE = `accountant-ai-api-${CACHE_VERSION}`;
const STATIC_CACHE = `accountant-ai-static-${CACHE_VERSION}`;

// Only cache true static assets (NEVER HTML)
const STATIC_ASSETS = ["/manifest.json", "/icon-192x192.png", "/icon-512x512.png"];

/* ---------- INSTALL ---------- */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

/* ---------- ACTIVATE ---------- */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

/* ---------- FETCH ---------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Ignore non-GET requests */
  if (request.method !== "GET") return;

  /* Ignore cross-origin except Supabase */
  if (url.origin !== self.location.origin && !url.hostname.includes("supabase")) {
    return;
  }

  /* 🚫 NEVER CACHE HTML / SPA NAVIGATION */
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  /* 🚫 NEVER CACHE JS or CSS (Vite handles hashing) */
  if (request.destination === "script" || request.destination === "style" || /\.(js|css|mjs)$/i.test(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  /* 🖼 IMAGE CACHE — stale-while-revalidate */
  if (request.destination === "image" || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        }),
      ),
    );
    return;
  }

  /* 🌐 API CACHE — network-first (5 min soft cache) */
  if (url.pathname.includes("/rest/") || url.pathname.includes("/functions/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            const headers = new Headers(clone.headers);
            headers.set("sw-cache-time", Date.now().toString());

            caches.open(API_CACHE).then((cache) => {
              cache.put(
                request,
                new Response(clone.body, {
                  status: clone.status,
                  statusText: clone.statusText,
                  headers,
                }),
              );
            });
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (!cached) {
              return new Response(JSON.stringify({ error: "Offline" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              });
            }
            return cached;
          }),
        ),
    );
    return;
  }

  /* 📦 Default — cache-first */
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        }),
    ),
  );
});

/* ---------- PUSH ---------- */
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");
  const data = event.data ? event.data.text() : "New notification";

  event.waitUntil(
    self.registration.showNotification("Accountant AI", {
      body: data,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200],
    }),
  );
});

/* ---------- NOTIFICATION CLICK ---------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return clients.openWindow("/");
    }),
  );
});

console.log("[SW] Loaded — SAFE MODE");
