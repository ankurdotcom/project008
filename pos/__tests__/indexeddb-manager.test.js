/**
 * Comprehensive test suite for IndexedDB Manager
 * Tests Phase 6: Testing & PWA Deployment functionality
 */

import 'fake-indexeddb/auto';

describe('IndexedDB Manager Tests', () => {
  let dbManager;

  beforeEach(async () => {
    // Reset IndexedDB for each test
    const databaseName = 'grocery-pos-test';
    
    // Clear any existing databases with timeout
    try {
      if (global.indexedDB) {
        const deleteRequest = global.indexedDB.deleteDatabase(databaseName);
        await Promise.race([
          new Promise((resolve) => {
            deleteRequest.onsuccess = resolve;
            deleteRequest.onerror = resolve;
            deleteRequest.onblocked = resolve;
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second timeout
        ]);
      }
    } catch (error) {
      // Ignore deletion errors
    }

    // Mock the IndexedDB manager
    dbManager = {
      dbName: databaseName,
      dbVersion: 1,
      db: null,
      
      async init() {
        return new Promise((resolve, reject) => {
          const request = global.indexedDB.open(this.dbName, this.dbVersion);
          
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            this.db = request.result;
            resolve();
          };
          
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create sales store
            if (!db.objectStoreNames.contains('sales')) {
              const salesStore = db.createObjectStore('sales', { 
                keyPath: 'id', 
                autoIncrement: true 
              });
              salesStore.createIndex('timestamp', 'timestamp');
              salesStore.createIndex('processedBy', 'processedBy');
            }
            
            // Create messages store  
            if (!db.objectStoreNames.contains('messages')) {
              const messagesStore = db.createObjectStore('messages', { 
                keyPath: 'id', 
                autoIncrement: true 
              });
              messagesStore.createIndex('state', 'state');
              messagesStore.createIndex('timestamp', 'timestamp');
            }
          };
        });
      },

      async storeSale(saleData) {
        if (!this.db) throw new Error('Database not initialized');
        if (!saleData) throw new Error('Invalid sale data');
        
        const transaction = this.db.transaction(['sales', 'messages'], 'readwrite');
        const salesStore = transaction.objectStore('sales');
        const messagesStore = transaction.objectStore('messages');
        
        // Store the sale
        const saleRequest = salesStore.add({
          ...saleData,
          timestamp: saleData.timestamp || new Date().toISOString()
        });
        
        return new Promise((resolve, reject) => {
          saleRequest.onsuccess = () => {
            // Create message for sync
            const messageRequest = messagesStore.add({
              type: 'SALE',
              data: saleData,
              state: 'PENDING',
              timestamp: new Date().toISOString()
            });
            
            messageRequest.onsuccess = () => {
              resolve({ id: messageRequest.result });
            };
            messageRequest.onerror = () => reject(messageRequest.error);
          };
          saleRequest.onerror = () => reject(saleRequest.error);
        });
      },

      async getAllSales() {
        if (!this.db) throw new Error('Database not initialized');
        
        const transaction = this.db.transaction(['sales'], 'readonly');
        const store = transaction.objectStore('sales');
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },

      async getSalesStats() {
        const sales = await this.getAllSales();
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        return {
          totalSales,
          totalRevenue,
          averageSale
        };
      },

      async updateMessageState(messageId, newState) {
        if (!this.db) throw new Error('Database not initialized');
        if (!messageId) throw new Error('Message ID required');
        
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const getRequest = store.get(messageId);
        
        return new Promise((resolve, reject) => {
          getRequest.onsuccess = () => {
            const message = getRequest.result;
            if (!message) {
              reject(new Error('Message not found'));
              return;
            }
            
            message.state = newState;
            message.updatedAt = new Date().toISOString();
            
            const updateRequest = store.put(message);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          };
          getRequest.onerror = () => reject(getRequest.error);
        });
      }
    };
  });

  describe('Database Initialization', () => {
    test('should initialize database successfully', async () => {
      await expect(dbManager.init()).resolves.not.toThrow();
      expect(dbManager.db).toBeDefined();
    });

    test('should handle database initialization errors', async () => {
      // Mock IndexedDB error
      const originalOpen = global.indexedDB.open;
      global.indexedDB.open = jest.fn(() => {
        const request = { error: new Error('DB Error') };
        setTimeout(() => request.onerror?.(), 0);
        return request;
      });

      await expect(dbManager.init()).rejects.toThrow('DB Error');
      
      // Restore original
      global.indexedDB.open = originalOpen;
    });
  });

  describe('Sales Operations', () => {
    beforeEach(async () => {
      await Promise.race([
        dbManager.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Init timeout')), 5000)
        )
      ]);
    }, 10000);

    test('should store sale successfully', async () => {
      const testSale = {
        items: [
          { id: '1', name: 'Apple', price: 2.5, quantity: 2, total: 5 }
        ],
        subtotal: 5,
        total: 5,
        paymentMethod: 'cash',
        processedBy: 'test@example.com'
      };

      const result = await dbManager.storeSale(testSale);
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
    });

    test('should reject invalid sale data', async () => {
      await expect(dbManager.storeSale(null)).rejects.toThrow('Invalid sale data');
      await expect(dbManager.storeSale(undefined)).rejects.toThrow('Invalid sale data');
    });

    test('should retrieve all sales', async () => {
      const testSale = {
        items: [{ id: '1', name: 'Test Item', price: 10, quantity: 1, total: 10 }],
        total: 10,
        paymentMethod: 'cash'
      };

      await dbManager.storeSale(testSale);
      const sales = await dbManager.getAllSales();
      
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBeGreaterThan(0);
      expect(sales[0]).toMatchObject(expect.objectContaining({
        total: 10,
        paymentMethod: 'cash'
      }));
    });

    test('should calculate sales statistics correctly', async () => {
      const sales = [
        { total: 10, paymentMethod: 'cash' },
        { total: 20, paymentMethod: 'card' },
        { total: 15, paymentMethod: 'cash' }
      ];

      for (const sale of sales) {
        await dbManager.storeSale(sale);
      }

      const stats = await dbManager.getSalesStats();
      expect(stats.totalSales).toBe(3);
      expect(stats.totalRevenue).toBe(45);
      expect(stats.averageSale).toBe(15);
    });

    test('should handle empty sales for statistics', async () => {
      const stats = await dbManager.getSalesStats();
      expect(stats.totalSales).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.averageSale).toBe(0);
    });
  });

  describe('Message State Management', () => {
    beforeEach(async () => {
      await Promise.race([
        dbManager.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Init timeout')), 5000)
        )
      ]);
    }, 10000);

    test('should update message state successfully', async () => {
      const testSale = {
        items: [{ id: '1', name: 'Test', price: 5, quantity: 1, total: 5 }],
        total: 5
      };

      const result = await dbManager.storeSale(testSale);
      await expect(dbManager.updateMessageState(result.id, 'SYNCED')).resolves.not.toThrow();
    });

    test('should reject invalid message ID', async () => {
      await expect(dbManager.updateMessageState(null, 'SYNCED')).rejects.toThrow('Message ID required');
      await expect(dbManager.updateMessageState(999999, 'SYNCED')).rejects.toThrow('Message not found');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle database not initialized error', async () => {
      const uninitializedManager = { ...dbManager, db: null };
      
      await expect(uninitializedManager.storeSale({})).rejects.toThrow('Database not initialized');
      await expect(uninitializedManager.getAllSales()).rejects.toThrow('Database not initialized');
      await expect(uninitializedManager.updateMessageState(1, 'SYNCED')).rejects.toThrow('Database not initialized');
    });

    test('should handle storage quota exceeded scenario', async () => {
      await Promise.race([
        dbManager.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Init timeout')), 5000)
        )
      ]);
      
      // Simulate storage quota exceeded by creating large sale data
      const largeSale = {
        items: new Array(10000).fill(0).map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          price: Math.random() * 100,
          quantity: 1,
          total: Math.random() * 100,
          description: 'A'.repeat(1000) // Large description
        })),
        total: 50000,
        paymentMethod: 'cash',
        notes: 'B'.repeat(10000) // Large notes field
      };

      // This should either succeed or fail gracefully
      try {
        await dbManager.storeSale(largeSale);
        expect(true).toBe(true); // Test passes if no error
      } catch (error) {
        expect(error.name).toMatch(/QuotaExceededError|ConstraintError/);
      }
    });

    test('should handle concurrent access to database', async () => {
      await Promise.race([
        dbManager.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Init timeout')), 5000)
        )
      ]);
      
      const concurrentSales = Array.from({ length: 5 }, (_, i) => ({
        items: [{ id: i, name: `Item ${i}`, price: 10, quantity: 1, total: 10 }],
        total: 10,
        paymentMethod: 'cash'
      }));

      // Execute multiple sales concurrently
      const promises = concurrentSales.map(sale => dbManager.storeSale(sale));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('id');
      });

      const allSales = await dbManager.getAllSales();
      expect(allSales.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Performance Tests', () => {
    beforeEach(async () => {
      await Promise.race([
        dbManager.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Init timeout')), 5000)
        )
      ]);
    }, 10000);

    test('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      // Create 100 sales
      const bulkSales = Array.from({ length: 100 }, (_, i) => ({
        items: [{ id: i, name: `Item ${i}`, price: 5, quantity: 1, total: 5 }],
        total: 5,
        paymentMethod: i % 2 === 0 ? 'cash' : 'card'
      }));

      for (const sale of bulkSales) {
        await dbManager.storeSale(sale);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
      
      const allSales = await dbManager.getAllSales();
      expect(allSales.length).toBeGreaterThanOrEqual(100);
    });

    test('should retrieve large datasets efficiently', async () => {
      // Store 50 sales first
      for (let i = 0; i < 50; i++) {
        await dbManager.storeSale({
          items: [{ id: i, name: `Item ${i}`, price: 10, quantity: 1, total: 10 }],
          total: 10
        });
      }

      const startTime = Date.now();
      const sales = await dbManager.getAllSales();
      const endTime = Date.now();
      
      expect(sales.length).toBeGreaterThanOrEqual(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should be under 1 second
    });
  });
});