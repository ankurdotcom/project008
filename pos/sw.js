/**
 * Service Worker for Offline-First POS System
 * Provides caching, background sync, and offline capabilities
 */

const CACHE_NAME = 'pos-cache-v1';
const API_CACHE_NAME = 'pos-api-cache-v1';
const OFFLINE_URL = '/offline.html';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/web-simple.html',
  '/indexeddb-manager.js',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/items'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('📦 Caching static assets...');

      try {
        await cache.addAll(STATIC_ASSETS);
        console.log('✅ Static assets cached successfully');
      } catch (error) {
        console.error('❌ Failed to cache static assets:', error);
        // Cache individually on failure
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn(`⚠️ Failed to cache ${asset}:`, err);
          }
        }
      }

      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );

      // Take control of all clients
      await self.clients.claim();
      console.log('✅ Service Worker activated and controlling clients');
    })()
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(request.url)) {
      // Cache-first strategy for static assets
      event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIEndpoint(request.url)) {
      // Network-first strategy for API calls
      event.respondWith(networkFirstStrategy(request));
    } else if (request.destination === 'document') {
      // Network-first for HTML pages with offline fallback
      event.respondWith(networkFirstWithOfflineFallback(request));
    } else {
      // Stale-while-revalidate for other resources
      event.respondWith(staleWhileRevalidateStrategy(request));
    }
  } else if (request.method === 'POST' && url.pathname === '/api/sales') {
    // Handle sales API calls specially
    event.respondWith(handleSalesSubmission(request));
  }
});

// Background sync for pending messages
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'sync-pending-sales') {
    event.waitUntil(syncPendingSales());
  } else if (event.tag === 'sync-sales-stats') {
    event.waitUntil(syncSalesStats());
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event.data?.text());

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper functions

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.js') ||
         url.includes('.css') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.svg');
}

function isAPIEndpoint(url) {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache-first strategy failed:', error);
    return new Response('Offline - Asset not cached', { status: 503 });
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline - API not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, serving offline page');
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>POS - Offline</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
          .offline { color: #f44336; }
        </style>
      </head>
      <body>
        <h1 class="offline">🔴 You're Offline</h1>
        <p>The POS system is currently offline. Please check your internet connection.</p>
        <p>Sales data will be stored locally and synced when you're back online.</p>
        <button onclick="window.location.reload()">🔄 Try Again</button>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.warn('⚠️ Network request failed:', error);
    return cachedResponse; // Return cached if network fails
  });

  return cachedResponse || fetchPromise;
}

// Handle sales submission with offline support
async function handleSalesSubmission(request) {
  try {
    // Try to send to server first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('🌐 Sales submission failed, will retry later');

    // Store for later sync
    const clonedRequest = request.clone();
    const saleData = await clonedRequest.json();

    // Notify the client that data is queued
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SALE_QUEUED_OFFLINE',
        data: saleData
      });
    });

    // Return success response for offline mode
    return new Response(JSON.stringify({
      success: true,
      message: 'Sale queued for offline sync',
      offline: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for pending sales
async function syncPendingSales() {
  console.log('🔄 Syncing pending sales...');

  try {
    // Get all queued messages from IndexedDB
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_PENDING_SALES'
      });
    }

    console.log('✅ Pending sales sync initiated');
  } catch (error) {
    console.error('❌ Failed to sync pending sales:', error);
  }
}

// Background sync for sales stats
async function syncSalesStats() {
  console.log('🔄 Syncing sales statistics...');

  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_SALES_STATS'
      });
    }

    console.log('✅ Sales stats sync initiated');
  } catch (error) {
    console.error('❌ Failed to sync sales stats:', error);
  }
}

// Periodic cleanup (runs every hour)
setInterval(async () => {
  console.log('🧹 Running periodic cleanup...');

  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    // Remove old cached items (older than 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const date = response.headers.get('date');
        if (date && new Date(date).getTime() < oneDayAgo) {
          await cache.delete(request);
          removedCount++;
        }
      }
    }

    if (removedCount > 0) {
      console.log(`🗑️ Cleaned up ${removedCount} old cache entries`);
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Run every hour

console.log('🎯 Service Worker loaded and ready');
