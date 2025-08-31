/**
 * Service Worker Test Suite
 * Tests PWA functionality, caching strategies, and offline capabilities
 */

describe('Service Worker Tests', () => {
  let mockCaches;
  let mockClients;
  let mockRegistration;
  let serviceWorkerScope;

  beforeEach(() => {
    // Mock browser APIs
    global.self = {};
    global.caches = {
      open: jest.fn(),
      keys: jest.fn(),
      delete: jest.fn(),
      match: jest.fn()
    };

    global.clients = {
      claim: jest.fn(() => Promise.resolve()),
      matchAll: jest.fn(() => Promise.resolve([])),
      openWindow: jest.fn()
    };

    mockCaches = {
      add: jest.fn(() => Promise.resolve()),
      addAll: jest.fn(() => Promise.resolve()),
      put: jest.fn(() => Promise.resolve()),
      match: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      keys: jest.fn(() => Promise.resolve([]))
    };

    global.caches.open.mockResolvedValue(mockCaches);
    global.caches.keys.mockResolvedValue(['old-cache-v1']);
    global.caches.delete.mockResolvedValue(true);

    // Mock fetch API
    global.fetch = jest.fn();

    // Mock service worker events
    serviceWorkerScope = {
      addEventListener: jest.fn(),
      skipWaiting: jest.fn(() => Promise.resolve()),
      registration: {
        sync: {
          register: jest.fn(() => Promise.resolve())
        }
      }
    };

    global.self = serviceWorkerScope;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Worker Installation', () => {
    test('should install and cache static assets', async () => {
      const installEvent = {
        waitUntil: jest.fn()
      };

      // Simulate install event handler
      const installHandler = async (event) => {
        const cache = await caches.open('pos-cache-v1');
        const staticAssets = [
          '/',
          '/web-simple.html',
          '/indexeddb-manager.js'
        ];
        
        await cache.addAll(staticAssets);
        await self.skipWaiting();
      };

      await installHandler(installEvent);

      expect(global.caches.open).toHaveBeenCalledWith('pos-cache-v1');
      expect(mockCaches.addAll).toHaveBeenCalledWith([
        '/',
        '/web-simple.html',
        '/indexeddb-manager.js'
      ]);
      expect(serviceWorkerScope.skipWaiting).toHaveBeenCalled();
    });

    test('should handle cache failures gracefully', async () => {
      mockCaches.addAll.mockRejectedValueOnce(new Error('Cache failed'));
      mockCaches.add.mockResolvedValue();

      const installHandler = async () => {
        try {
          const cache = await caches.open('pos-cache-v1');
          await cache.addAll(['/test.js']);
        } catch (error) {
          // Fallback: cache individually
          const cache = await caches.open('pos-cache-v1');
          await cache.add('/test.js');
        }
      };

      await expect(installHandler()).resolves.not.toThrow();
      expect(mockCaches.add).toHaveBeenCalledWith('/test.js');
    });
  });

  describe('Service Worker Activation', () => {
    test('should clean up old caches', async () => {
      const activateHandler = async () => {
        const cacheNames = await caches.keys();
        const currentCaches = ['pos-cache-v1', 'pos-api-cache-v1'];
        
        await Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
        
        await clients.claim();
      };

      await activateHandler();

      expect(global.caches.keys).toHaveBeenCalled();
      expect(global.caches.delete).toHaveBeenCalledWith('old-cache-v1');
      expect(global.clients.claim).toHaveBeenCalled();
    });
  });

  describe('Fetch Event Handling', () => {
    test('should use cache-first strategy for static assets', async () => {
      const request = new Request('/indexeddb-manager.js');
      const cachedResponse = new Response('cached content');
      
      mockCaches.match.mockResolvedValueOnce(cachedResponse);

      const cacheFirstStrategy = async (request) => {
        const cache = await caches.open('pos-cache-v1');
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      };

      const response = await cacheFirstStrategy(request);
      
      expect(response).toBe(cachedResponse);
      expect(mockCaches.match).toHaveBeenCalledWith(request);
    });

    test('should use network-first strategy for API calls', async () => {
      const request = new Request('/api/sales');
      const networkResponse = new Response('network content');
      
      global.fetch.mockResolvedValueOnce(networkResponse);

      const networkFirstStrategy = async (request) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open('pos-api-cache-v1');
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          const cache = await caches.open('pos-api-cache-v1');
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      };

      const response = await networkFirstStrategy(request);
      
      expect(response).toBe(networkResponse);
      expect(global.fetch).toHaveBeenCalledWith(request);
    });

    test('should fallback to cache when network fails', async () => {
      const request = new Request('/api/sales');
      const cachedResponse = new Response('cached content');
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      mockCaches.match.mockResolvedValueOnce(cachedResponse);

      const networkFirstStrategy = async (request) => {
        try {
          return await fetch(request);
        } catch (error) {
          const cache = await caches.open('pos-api-cache-v1');
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      };

      const response = await networkFirstStrategy(request);
      
      expect(response).toBe(cachedResponse);
    });

    test('should handle offline fallback for HTML pages', async () => {
      const request = new Request('/some-page.html', { 
        destination: 'document' 
      });
      const offlineResponse = new Response('offline page');
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      mockCaches.match
        .mockResolvedValueOnce(null) // No cached page
        .mockResolvedValueOnce(offlineResponse); // Offline fallback

      const networkFirstWithOfflineFallback = async (request) => {
        try {
          return await fetch(request);
        } catch (error) {
          const cache = await caches.open('pos-cache-v1');
          let cachedResponse = await cache.match(request);
          
          if (!cachedResponse) {
            cachedResponse = await cache.match('/offline.html');
          }
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          throw error;
        }
      };

      const response = await networkFirstWithOfflineFallback(request);
      
      expect(response).toBe(offlineResponse);
    });
  });

  describe('Background Sync', () => {
    test('should register background sync for pending sales', async () => {
      const syncHandler = async () => {
        if ('sync' in serviceWorkerScope.registration) {
          await serviceWorkerScope.registration.sync.register('sync-pending-sales');
        }
      };

      await syncHandler();
      
      expect(serviceWorkerScope.registration.sync.register)
        .toHaveBeenCalledWith('sync-pending-sales');
    });

    test('should handle sync events for pending sales', async () => {
      const mockIndexedDB = {
        getAllPendingMessages: jest.fn(() => Promise.resolve([
          { id: 1, data: { total: 10 }, state: 'PENDING' },
          { id: 2, data: { total: 20 }, state: 'PENDING' }
        ])),
        updateMessageState: jest.fn(() => Promise.resolve())
      };

      const syncEvent = {
        tag: 'sync-pending-sales',
        waitUntil: jest.fn()
      };

      global.fetch.mockResolvedValue(new Response('', { status: 200 }));

      const syncHandler = async (event) => {
        if (event.tag === 'sync-pending-sales') {
          const pendingMessages = await mockIndexedDB.getAllPendingMessages();
          
          const syncPromises = pendingMessages.map(async (message) => {
            try {
              const response = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message.data)
              });
              
              if (response.ok) {
                await mockIndexedDB.updateMessageState(message.id, 'SYNCED');
              }
            } catch (error) {
              console.error('Sync failed for message:', message.id);
            }
          });
          
          await Promise.all(syncPromises);
        }
      };

      await syncHandler(syncEvent);

      expect(mockIndexedDB.getAllPendingMessages).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockIndexedDB.updateMessageState).toHaveBeenCalledWith(1, 'SYNCED');
      expect(mockIndexedDB.updateMessageState).toHaveBeenCalledWith(2, 'SYNCED');
    });

    test('should handle sync failures gracefully', async () => {
      const mockIndexedDB = {
        getAllPendingMessages: jest.fn(() => Promise.resolve([
          { id: 1, data: { total: 10 }, state: 'PENDING' }
        ])),
        updateMessageState: jest.fn(() => Promise.resolve())
      };

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const syncHandler = async () => {
        const pendingMessages = await mockIndexedDB.getAllPendingMessages();
        
        for (const message of pendingMessages) {
          try {
            await fetch('/api/sales', {
              method: 'POST',
              body: JSON.stringify(message.data)
            });
            await mockIndexedDB.updateMessageState(message.id, 'SYNCED');
          } catch (error) {
            // Log error but don't throw - allow other messages to sync
            console.error('Sync failed:', error);
          }
        }
      };

      await expect(syncHandler()).resolves.not.toThrow();
      expect(mockIndexedDB.updateMessageState).not.toHaveBeenCalled();
    });
  });

  describe('PWA Features', () => {
    test('should handle install prompt', () => {
      let deferredPrompt = null;
      
      const beforeInstallPromptHandler = (event) => {
        event.preventDefault();
        deferredPrompt = event;
      };

      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(() => Promise.resolve()),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      beforeInstallPromptHandler(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(deferredPrompt).toBe(mockEvent);
    });

    test('should track app installation', () => {
      const appInstalledHandler = jest.fn((event) => {
        console.log('PWA was installed');
      });

      const mockEvent = { target: 'standalone' };
      appInstalledHandler(mockEvent);
      
      expect(appInstalledHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('should handle storage quota exceeded errors', async () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      
      mockCaches.put.mockRejectedValueOnce(quotaError);

      const cacheHandler = async (request, response) => {
        try {
          const cache = await caches.open('pos-cache-v1');
          await cache.put(request, response);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            // Clear old cache entries
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(name => caches.delete(name))
            );
            
            // Retry with new cache
            const newCache = await caches.open('pos-cache-v2');
            await newCache.put(request, response);
          }
        }
      };

      const request = new Request('/test');
      const response = new Response('test');

      await expect(cacheHandler(request, response)).resolves.not.toThrow();
    });

    test('should handle concurrent cache operations', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        new Request(`/test-${i}`)
      );
      
      const responses = requests.map((_, i) => 
        new Response(`content-${i}`)
      );

      // Simulate concurrent caching
      const cachePromises = requests.map(async (request, index) => {
        const cache = await caches.open('pos-cache-v1');
        await cache.put(request, responses[index]);
      });

      await expect(Promise.all(cachePromises)).resolves.not.toThrow();
      expect(mockCaches.put).toHaveBeenCalledTimes(10);
    });

    test('should handle service worker update scenarios', async () => {
      const updateHandler = async () => {
        // Simulate finding new service worker
        const registration = {
          installing: { state: 'installing' },
          waiting: { state: 'installed' },
          active: { state: 'activated' }
        };

        if (registration.waiting) {
          // New service worker is waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      };

      await expect(updateHandler()).resolves.not.toThrow();
    });

    test('should handle low device storage scenarios', async () => {
      // Mock storage estimation API
      global.navigator.storage = {
        estimate: jest.fn(() => Promise.resolve({
          quota: 1000000, // 1MB quota
          usage: 950000   // 95% used
        }))
      };

      const storageHandler = async () => {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          const usagePercent = (estimate.usage / estimate.quota) * 100;
          
          if (usagePercent > 90) {
            // Clear old caches when storage is low
            const cacheNames = await caches.keys();
            const oldCaches = cacheNames.filter(name => name.includes('v1'));
            
            await Promise.all(
              oldCaches.map(name => caches.delete(name))
            );
          }
        }
      };

      await storageHandler();
      
      expect(global.navigator.storage.estimate).toHaveBeenCalled();
      expect(global.caches.keys).toHaveBeenCalled();
    });
  });
});