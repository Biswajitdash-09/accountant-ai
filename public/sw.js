const CACHE_VERSION = 'v3.2';
const CACHE_NAME = `accountant-ai-${CACHE_VERSION}`;
const STATIC_CACHE = `accountant-ai-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `accountant-ai-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `accountant-ai-images-${CACHE_VERSION}`;
const API_CACHE = `accountant-ai-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => 
              name !== STATIC_CACHE && 
              name !== DYNAMIC_CACHE && 
              name !== IMAGE_CACHE && 
              name !== API_CACHE
            )
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except for known CDNs
  if (url.origin !== location.origin && !url.hostname.includes('supabase')) {
    return;
  }

  // IMPORTANT: Never cache Vite dev modules / HMR endpoints.
  // Caching these can serve mismatched module graphs and cause React hook dispatcher errors
  // like: "Cannot read properties of null (reading 'useState')".
  const isViteDevAsset =
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('/node_modules/.vite/') ||
    url.pathname.includes('/.vite/deps/');

  if (isViteDevAsset) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigations (SPA routes) - network first, fallback to cached shell
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              // Cache the app shell (index) for offline fallback
              cache.put('/', responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Image caching - stale-while-revalidate
  if (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // API calls - network first with 5-minute cache
  if (url.pathname.includes('/functions/') || url.pathname.includes('/rest/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful GET requests
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              // Add cache expiration header
              const headers = new Headers(responseClone.headers);
              headers.set('sw-cache-time', Date.now().toString());
              const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers,
              });
              cache.put(request, modifiedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Check cache for offline fallback
          return caches.match(request).then((cached) => {
            if (cached) {
              // Check if cache is stale (older than 5 minutes)
              const cacheTime = cached.headers.get('sw-cache-time');
              if (cacheTime) {
                const age = Date.now() - parseInt(cacheTime);
                if (age > 5 * 60 * 1000) {
                  console.log('[SW] Serving stale API cache');
                }
              }
              return cached;
            }
            return new Response(JSON.stringify({ error: 'Offline - data not available' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // JS/CSS bundles - network first (prevents stale UI after deploy)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    /\.(css|js|mjs)$/i.test(url.pathname)
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 503 }));
    })
  );

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(
      // Sync logic would go here
      Promise.resolve()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Accountant AI',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Accountant AI', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if no existing window
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
    );
  }
});

console.log('[SW] Service worker loaded');