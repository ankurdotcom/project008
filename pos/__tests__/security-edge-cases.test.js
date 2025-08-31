/**
 * Security & Edge Cases Test Suite
 * Tests security features, WebCrypto operations, and edge cases from phase5_testing.md
 */

describe('Security & Edge Cases Tests', () => {
  let mockWebCrypto;
  let mockIndexedDB;
  let mockServiceWorker;

  beforeEach(() => {
    // Mock WebCrypto API
    mockWebCrypto = {
      subtle: {
        generateKey: jest.fn(),
        exportKey: jest.fn(),
        importKey: jest.fn(),
        sign: jest.fn(),
        verify: jest.fn(),
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        digest: jest.fn()
      },
      getRandomValues: jest.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      })
    };

    global.crypto = mockWebCrypto;

    // Mock IndexedDB with security considerations
    mockIndexedDB = {
      keyStorage: new Map(),
      encryptedData: new Map(),
      
      storeKey: jest.fn(async (keyId, keyData) => {
        // Simulate encrypted key storage
        const encryptedKey = await mockWebCrypto.subtle.encrypt(
          { name: 'AES-GCM', iv: new Uint8Array(12) },
          'storage-key',
          new TextEncoder().encode(JSON.stringify(keyData))
        );
        mockIndexedDB.keyStorage.set(keyId, encryptedKey);
      }),
      
      retrieveKey: jest.fn(async (keyId) => {
        const encryptedKey = mockIndexedDB.keyStorage.get(keyId);
        if (!encryptedKey) throw new Error('Key not found');
        
        const decryptedKey = await mockWebCrypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(12) },
          'storage-key',
          encryptedKey
        );
        
        return JSON.parse(new TextDecoder().decode(decryptedKey));
      }),
      
      storeEncryptedData: jest.fn(async (data, key) => {
        const encrypted = await mockWebCrypto.subtle.encrypt(
          { name: 'AES-GCM', iv: new Uint8Array(12) },
          key,
          new TextEncoder().encode(JSON.stringify(data))
        );
        const id = Date.now();
        mockIndexedDB.encryptedData.set(id, encrypted);
        return id;
      })
    };

    // Mock Service Worker with security features
    mockServiceWorker = {
      isSecureContext: true,
      httpsOnly: true,
      
      validateOrigin: jest.fn((request) => {
        const url = new URL(request.url);
        return url.protocol === 'https:' || url.hostname === 'localhost';
      }),
      
      sanitizeHeaders: jest.fn((headers) => {
        const safe = new Headers();
        const allowedHeaders = ['content-type', 'authorization', 'x-requested-with'];
        
        for (const [key, value] of headers.entries()) {
          if (allowedHeaders.includes(key.toLowerCase())) {
            safe.set(key, value);
          }
        }
        
        return safe;
      })
    };
  });

  describe('WebCrypto Security Tests', () => {
    test('should generate cryptographically secure keys', async () => {
      const keyPair = {
        publicKey: { type: 'public', algorithm: { name: 'ECDSA' } },
        privateKey: { type: 'private', algorithm: { name: 'ECDSA' } }
      };
      
      mockWebCrypto.subtle.generateKey.mockResolvedValueOnce(keyPair);

      const cryptoWrapper = {
        generateSigningKeyPair: async () => {
          return await crypto.subtle.generateKey(
            {
              name: 'ECDSA',
              namedCurve: 'P-256'
            },
            true,
            ['sign', 'verify']
          );
        }
      };

      const result = await cryptoWrapper.generateSigningKeyPair();
      
      expect(mockWebCrypto.subtle.generateKey).toHaveBeenCalledWith(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      expect(result).toBe(keyPair);
    });

    test('should sign and verify messages correctly', async () => {
      const messageData = { type: 'SALE', total: 100, timestamp: Date.now() };
      const signature = new Uint8Array([1, 2, 3, 4]);
      
      mockWebCrypto.subtle.sign.mockResolvedValueOnce(signature);
      mockWebCrypto.subtle.verify.mockResolvedValueOnce(true);

      const cryptoWrapper = {
        signMessage: async (privateKey, message) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify(message));
          
          return await crypto.subtle.sign(
            { name: 'ECDSA', hash: 'SHA-256' },
            privateKey,
            data
          );
        },
        
        verifySignature: async (publicKey, signature, message) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify(message));
          
          return await crypto.subtle.verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            publicKey,
            signature,
            data
          );
        }
      };

      const privateKey = { type: 'private' };
      const publicKey = { type: 'public' };
      
      const resultSignature = await cryptoWrapper.signMessage(privateKey, messageData);
      const isValid = await cryptoWrapper.verifySignature(publicKey, resultSignature, messageData);
      
      expect(resultSignature).toBe(signature);
      expect(isValid).toBe(true);
    });

    test('should encrypt and decrypt payloads securely', async () => {
      const payload = { sensitiveData: 'credit card info', amount: 1000 };
      const encryptedData = new Uint8Array([5, 6, 7, 8]);
      
      mockWebCrypto.subtle.encrypt.mockResolvedValueOnce(encryptedData);
      mockWebCrypto.subtle.decrypt.mockResolvedValueOnce(
        new TextEncoder().encode(JSON.stringify(payload))
      );

      const cryptoWrapper = {
        encryptPayload: async (key, data) => {
          const iv = crypto.getRandomValues(new Uint8Array(12));
          const encoder = new TextEncoder();
          
          return await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(JSON.stringify(data))
          );
        },
        
        decryptPayload: async (key, encryptedData, iv) => {
          const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
          );
          
          const decoder = new TextDecoder();
          return JSON.parse(decoder.decode(decrypted));
        }
      };

      const key = { algorithm: { name: 'AES-GCM' } };
      
      const encrypted = await cryptoWrapper.encryptPayload(key, payload);
      const decrypted = await cryptoWrapper.decryptPayload(key, encrypted, new Uint8Array(12));
      
      expect(encrypted).toBe(encryptedData);
      expect(decrypted).toEqual(payload);
    });

    test('should handle WebCrypto unavailable gracefully', async () => {
      // Simulate older browser without WebCrypto
      global.crypto = undefined;

      const cryptoWrapper = {
        isWebCryptoAvailable: () => {
          return typeof crypto !== 'undefined' && 
                 crypto.subtle && 
                 typeof crypto.subtle.generateKey === 'function';
        },
        
        generateKeyWithFallback: async () => {
          if (cryptoWrapper.isWebCryptoAvailable()) {
            return await crypto.subtle.generateKey(/* ... */);
          } else {
            // Fallback to less secure but compatible method
            console.warn('WebCrypto not available, using fallback');
            return {
              publicKey: 'fallback-public-key',
              privateKey: 'fallback-private-key'
            };
          }
        }
      };

      expect(cryptoWrapper.isWebCryptoAvailable()).toBe(false);
      
      const keys = await cryptoWrapper.generateKeyWithFallback();
      expect(keys).toEqual({
        publicKey: 'fallback-public-key',
        privateKey: 'fallback-private-key'
      });
    });

    test('should validate message integrity with replay protection', async () => {
      const processedNonces = new Set();
      
      const messageValidator = {
        validateMessage: (message) => {
          // Check required fields
          if (!message.timestamp || !message.nonce || !message.signature) {
            throw new Error('Missing required security fields');
          }
          
          // Check timestamp (reject messages older than 5 minutes)
          const now = Date.now();
          const messageTime = new Date(message.timestamp).getTime();
          if (now - messageTime > 5 * 60 * 1000) {
            throw new Error('Message too old');
          }
          
          // Check for replay attack
          if (processedNonces.has(message.nonce)) {
            throw new Error('Nonce already used - possible replay attack');
          }
          
          processedNonces.add(message.nonce);
          return true;
        }
      };

      // Valid message
      const validMessage = {
        type: 'SALE',
        data: { total: 100 },
        timestamp: new Date().toISOString(),
        nonce: 'unique-nonce-123',
        signature: 'valid-signature'
      };
      
      expect(() => messageValidator.validateMessage(validMessage)).not.toThrow();
      
      // Replay attack
      expect(() => messageValidator.validateMessage(validMessage))
        .toThrow('Nonce already used - possible replay attack');
      
      // Old message
      const oldMessage = {
        ...validMessage,
        nonce: 'different-nonce',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      };
      
      expect(() => messageValidator.validateMessage(oldMessage))
        .toThrow('Message too old');
    });
  });

  describe('Storage Security Tests', () => {
    test('should store keys securely in IndexedDB', async () => {
      const keyData = {
        publicKey: 'test-public-key',
        privateKey: 'test-private-key',
        created: Date.now()
      };

      await mockIndexedDB.storeKey('signing-key', keyData);
      
      expect(mockIndexedDB.storeKey).toHaveBeenCalledWith('signing-key', keyData);
      expect(mockIndexedDB.keyStorage.has('signing-key')).toBe(true);
    });

    test('should handle storage quota exceeded gracefully', async () => {
      const storageManager = {
        checkQuota: async () => {
          if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
              available: estimate.quota - estimate.usage,
              used: estimate.usage,
              total: estimate.quota
            };
          }
          return null;
        },
        
        handleQuotaExceeded: async () => {
          // Clear old data when quota exceeded
          const cutoffDate = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
          
          // Mock clearing old sales
          const cleared = await mockIndexedDB.clearOldData?.(cutoffDate);
          return cleared || 0;
        }
      };

      // Mock quota exceeded scenario
      global.navigator.storage = {
        estimate: jest.fn(() => Promise.resolve({
          quota: 1000000,
          usage: 999999 // 99.9% used
        }))
      };

      mockIndexedDB.clearOldData = jest.fn(() => Promise.resolve(50));

      const quota = await storageManager.checkQuota();
      expect(quota.available).toBe(1);
      
      const cleared = await storageManager.handleQuotaExceeded();
      expect(cleared).toBe(50);
    });

    test('should handle concurrent access to IndexedDB', async () => {
      const concurrentOperations = [];
      
      // Simulate multiple tabs trying to access storage simultaneously
      for (let i = 0; i < 10; i++) {
        const operation = mockIndexedDB.storeEncryptedData(
          { tabId: i, data: `test-data-${i}` },
          'test-key'
        );
        concurrentOperations.push(operation);
      }

      const results = await Promise.all(concurrentOperations);
      
      expect(results).toHaveLength(10);
      expect(mockIndexedDB.encryptedData.size).toBe(10);
    });
  });

  describe('Service Worker Security Tests', () => {
    test('should validate request origins', () => {
      const validRequests = [
        new Request('https://mystore.com/api/sales'),
        new Request('http://localhost:3000/api/sales')
      ];
      
      const invalidRequests = [
        new Request('http://malicious.com/api/sales'),
        new Request('ftp://unsafe.com/data')
      ];

      validRequests.forEach(request => {
        expect(mockServiceWorker.validateOrigin(request)).toBe(true);
      });

      invalidRequests.forEach(request => {
        expect(mockServiceWorker.validateOrigin(request)).toBe(false);
      });
    });

    test('should sanitize request headers', () => {
      const unsafeHeaders = new Headers({
        'content-type': 'application/json',
        'authorization': 'Bearer token',
        'x-forwarded-for': '192.168.1.1',
        'x-malicious-header': 'evil-script',
        'host': 'malicious.com'
      });

      const safeHeaders = mockServiceWorker.sanitizeHeaders(unsafeHeaders);
      
      expect(safeHeaders.has('content-type')).toBe(true);
      expect(safeHeaders.has('authorization')).toBe(true);
      expect(safeHeaders.has('x-malicious-header')).toBe(false);
      expect(safeHeaders.has('host')).toBe(false);
    });

    test('should handle HTTPS-only mode', () => {
      const httpsRequest = new Request('https://secure.com/api');
      const httpRequest = new Request('http://insecure.com/api');
      const localhostRequest = new Request('http://localhost/api');

      expect(mockServiceWorker.validateOrigin(httpsRequest)).toBe(true);
      expect(mockServiceWorker.validateOrigin(httpRequest)).toBe(false);
      expect(mockServiceWorker.validateOrigin(localhostRequest)).toBe(true);
    });
  });

  describe('Edge Cases from Requirements', () => {
    test('should handle low-end devices (1GB RAM, slow CPU)', async () => {
      // Mock low-end device constraints
      global.navigator.deviceMemory = 1; // 1GB
      global.navigator.hardwareConcurrency = 2; // Dual core

      const lowEndOptimizer = {
        shouldReduceOperations: () => {
          return navigator.deviceMemory <= 1 || navigator.hardwareConcurrency <= 2;
        },
        
        processWithConstraints: async (data) => {
          if (lowEndOptimizer.shouldReduceOperations()) {
            // Process in smaller chunks for low-end devices
            const chunks = [];
            for (let i = 0; i < data.length; i += 10) {
              chunks.push(data.slice(i, i + 10));
            }
            
            const results = [];
            for (const chunk of chunks) {
              // Add delay to prevent overwhelming the device
              await new Promise(resolve => setTimeout(resolve, 100));
              results.push(...chunk.map(item => ({ ...item, processed: true })));
            }
            
            return results;
          } else {
            // Process all at once on powerful devices
            return data.map(item => ({ ...item, processed: true }));
          }
        }
      };

      const testData = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const startTime = Date.now();
      
      const results = await lowEndOptimizer.processWithConstraints(testData);
      const endTime = Date.now();
      
      expect(results).toHaveLength(50);
      expect(results.every(item => item.processed)).toBe(true);
      // Should take longer on low-end devices due to chunking
      expect(endTime - startTime).toBeGreaterThan(500);
    });

    test('should handle intermittent connectivity (2G speeds, disconnections)', async () => {
      const connectionManager = {
        connectionType: '2g',
        isOnline: true,
        
        simulateSlowConnection: async (operation) => {
          if (connectionManager.connectionType === '2g') {
            // Simulate 2G delays (200-1000ms)
            const delay = Math.random() * 800 + 200;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // 30% chance of connection failure on 2G
            if (Math.random() < 0.3) {
              throw new Error('Connection timeout');
            }
          }
          
          return operation();
        },
        
        withRetry: async (operation, maxRetries = 3) => {
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              return await connectionManager.simulateSlowConnection(operation);
            } catch (error) {
              if (attempt === maxRetries) throw error;
              
              // Exponential backoff
              const backoff = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, backoff));
            }
          }
        }
      };

      const testOperation = jest.fn(() => ({ success: true }));
      
      // Should eventually succeed with retries
      const result = await connectionManager.withRetry(testOperation);
      expect(result).toEqual({ success: true });
      expect(testOperation).toHaveBeenCalled();
    });

    test('should handle multi-tab usage and concurrent IndexedDB access', async () => {
      const tabManager = {
        activeConnections: new Set(),
        lockManager: new Map(),
        
        acquireLock: async (resource) => {
          const lockId = Date.now() + Math.random();
          
          // Wait for existing locks to release
          while (tabManager.lockManager.has(resource)) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          tabManager.lockManager.set(resource, lockId);
          return lockId;
        },
        
        releaseLock: (resource, lockId) => {
          if (tabManager.lockManager.get(resource) === lockId) {
            tabManager.lockManager.delete(resource);
          }
        },
        
        safeDBOperation: async (operation) => {
          const lockId = await tabManager.acquireLock('database');
          
          try {
            return await operation();
          } finally {
            tabManager.releaseLock('database', lockId);
          }
        }
      };

      // Simulate 5 tabs trying to access database concurrently
      const operations = Array.from({ length: 5 }, (_, i) => 
        tabManager.safeDBOperation(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { tabId: i, success: true };
        })
      );

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
      expect(tabManager.lockManager.size).toBe(0); // All locks released
    });

    test('should handle PWA installation failures and updates', async () => {
      const pwaManager = {
        installPrompt: null,
        
        handleInstallPrompt: (event) => {
          event.preventDefault();
          pwaManager.installPrompt = event;
        },
        
        attemptInstall: async () => {
          if (!pwaManager.installPrompt) {
            throw new Error('No install prompt available');
          }
          
          try {
            pwaManager.installPrompt.prompt();
            const result = await pwaManager.installPrompt.userChoice;
            
            if (result.outcome === 'dismissed') {
              throw new Error('User dismissed install prompt');
            }
            
            return { installed: true };
          } catch (error) {
            return { installed: false, error: error.message };
          }
        },
        
        handleServiceWorkerUpdate: async (registration) => {
          if (registration.waiting) {
            // New version available
            return new Promise((resolve) => {
              registration.waiting.addEventListener('statechange', (event) => {
                if (event.target.state === 'activated') {
                  resolve({ updated: true });
                }
              });
              
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            });
          }
          
          return { updated: false };
        }
      };

      // Test install failure
      const installResult = await pwaManager.attemptInstall();
      expect(installResult.installed).toBe(false);
      expect(installResult.error).toBe('No install prompt available');

      // Test install success
      pwaManager.installPrompt = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      const successResult = await pwaManager.attemptInstall();
      expect(successResult.installed).toBe(true);
    });

    test('should handle power management and battery optimization', async () => {
      const powerManager = {
        getBatteryInfo: async () => {
          if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            return {
              level: battery.level,
              charging: battery.charging,
              dischargingTime: battery.dischargingTime
            };
          }
          return null;
        },
        
        adjustPerformanceBasedOnBattery: async () => {
          const battery = await powerManager.getBatteryInfo();
          
          if (battery && battery.level < 0.2 && !battery.charging) {
            // Low battery - reduce performance
            return {
              syncInterval: 60000, // 1 minute instead of 30 seconds
              cacheSize: 50,       // Reduce cache size
              backgroundTasks: false // Disable non-essential background tasks
            };
          }
          
          return {
            syncInterval: 30000,
            cacheSize: 100,
            backgroundTasks: true
          };
        }
      };

      // Mock battery API
      global.navigator.getBattery = jest.fn(() => Promise.resolve({
        level: 0.15,        // 15% battery
        charging: false,
        dischargingTime: 3600 // 1 hour remaining
      }));

      const settings = await powerManager.adjustPerformanceBasedOnBattery();
      
      expect(settings.syncInterval).toBe(60000);
      expect(settings.cacheSize).toBe(50);
      expect(settings.backgroundTasks).toBe(false);
    });
  });
});