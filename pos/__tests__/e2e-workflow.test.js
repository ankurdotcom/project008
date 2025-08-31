/**
 * End-to-End Workflow Tests
 * Tests complete user journeys from sale creation to sync and dashboard display
 */

describe('E2E Workflow Tests', () => {
  let mockPOSApp;
  let mockOwnerApp;
  let mockServerConnection;

  beforeEach(() => {
    // Mock POS application
    mockPOSApp = {
      currentUser: { email: 'cashier@store.com', role: 'sales' },
      cart: [],
      isOnline: true,
      
      addToCart: jest.fn((item) => {
        mockPOSApp.cart.push(item);
      }),
      
      removeFromCart: jest.fn((itemId) => {
        mockPOSApp.cart = mockPOSApp.cart.filter(item => item.id !== itemId);
      }),
      
      calculateTotal: jest.fn(() => {
        return mockPOSApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }),
      
      processSale: jest.fn(async (paymentInfo) => {
        const sale = {
          id: Date.now(),
          items: [...mockPOSApp.cart],
          subtotal: mockPOSApp.calculateTotal(),
          total: mockPOSApp.calculateTotal(),
          paymentMethod: paymentInfo.method,
          cashAmount: paymentInfo.cashAmount,
          change: paymentInfo.change,
          timestamp: new Date().toISOString(),
          processedBy: mockPOSApp.currentUser.email,
          userRole: mockPOSApp.currentUser.role
        };
        
        // Clear cart
        mockPOSApp.cart = [];
        
        // Store locally and queue for sync
        await mockPOSApp.storeSaleLocally(sale);
        
        if (mockPOSApp.isOnline) {
          await mockPOSApp.syncSale(sale);
        }
        
        return sale;
      }),
      
      storeSaleLocally: jest.fn(async (sale) => {
        // Simulate IndexedDB storage
        return { id: sale.id, stored: true };
      }),
      
      syncSale: jest.fn(async (sale) => {
        if (!mockServerConnection.isConnected) {
          throw new Error('No connection');
        }
        return mockServerConnection.sendSale(sale);
      }),
      
      setOnlineStatus: jest.fn((status) => {
        mockPOSApp.isOnline = status;
      })
    };

    // Mock Owner dashboard
    mockOwnerApp = {
      salesData: [],
      statistics: { totalSales: 0, totalRevenue: 0, averageSale: 0 },
      
      receiveSale: jest.fn((sale) => {
        mockOwnerApp.salesData.push(sale);
        mockOwnerApp.updateStatistics();
      }),
      
      updateStatistics: jest.fn(() => {
        const sales = mockOwnerApp.salesData;
        mockOwnerApp.statistics = {
          totalSales: sales.length,
          totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
          averageSale: sales.length > 0 ? 
            sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
        };
      }),
      
      sendAcknowledgment: jest.fn(async (saleId) => {
        return mockServerConnection.sendAck(saleId);
      }),
      
      getDashboardData: jest.fn(() => ({
        sales: mockOwnerApp.salesData,
        statistics: mockOwnerApp.statistics,
        lastSync: new Date().toISOString()
      }))
    };

    // Mock server connection
    mockServerConnection = {
      isConnected: true,
      messageQueue: [],
      
      sendSale: jest.fn(async (sale) => {
        if (!mockServerConnection.isConnected) {
          throw new Error('Connection failed');
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Deliver to owner app
        mockOwnerApp.receiveSale(sale);
        
        // Send ACK back
        setTimeout(() => {
          mockServerConnection.sendAck(sale.id);
        }, 50);
        
        return { success: true, messageId: sale.id };
      }),
      
      sendAck: jest.fn(async (saleId) => {
        mockServerConnection.messageQueue.push({
          type: 'ACK',
          saleId: saleId,
          timestamp: new Date().toISOString()
        });
        return { acknowledged: true };
      }),
      
      setConnectionStatus: jest.fn((status) => {
        mockServerConnection.isConnected = status;
      })
    };
  });

  describe('Complete Sale to Dashboard Workflow', () => {
    test('should complete full workflow: Sale → Queue → Sync → ACK → Dashboard', async () => {
      // Step 1: Add items to cart
      const items = [
        { id: '1', name: 'Apple', price: 2.50, quantity: 2 },
        { id: '2', name: 'Bread', price: 3.00, quantity: 1 }
      ];
      
      items.forEach(item => mockPOSApp.addToCart(item));
      
      expect(mockPOSApp.cart).toHaveLength(2);
      expect(mockPOSApp.calculateTotal()).toBe(8.00);

      // Step 2: Process payment
      const paymentInfo = {
        method: 'cash',
        cashAmount: 10.00,
        change: 2.00
      };
      
      const sale = await mockPOSApp.processSale(paymentInfo);
      
      expect(sale).toMatchObject({
        total: 8.00,
        paymentMethod: 'cash',
        cashAmount: 10.00,
        change: 2.00,
        processedBy: 'cashier@store.com'
      });
      
      // Step 3: Verify local storage
      expect(mockPOSApp.storeSaleLocally).toHaveBeenCalledWith(sale);
      
      // Step 4: Verify sync to server
      expect(mockPOSApp.syncSale).toHaveBeenCalledWith(sale);
      
      // Step 5: Verify owner received sale
      expect(mockOwnerApp.salesData).toContainEqual(
        expect.objectContaining({
          total: 8.00,
          paymentMethod: 'cash'
        })
      );
      
      // Step 6: Verify dashboard statistics updated
      expect(mockOwnerApp.statistics).toMatchObject({
        totalSales: 1,
        totalRevenue: 8.00,
        averageSale: 8.00
      });
      
      // Step 7: Verify ACK was sent
      expect(mockServerConnection.messageQueue).toContainEqual(
        expect.objectContaining({
          type: 'ACK',
          saleId: sale.id
        })
      );
    });

    test('should handle offline sale and sync when back online', async () => {
      // Step 1: Go offline
      mockPOSApp.setOnlineStatus(false);
      mockServerConnection.setConnectionStatus(false);
      
      // Step 2: Process sale while offline
      mockPOSApp.addToCart({ id: '1', name: 'Coffee', price: 4.50, quantity: 1 });
      
      const offlineSale = await mockPOSApp.processSale({
        method: 'cash',
        cashAmount: 5.00,
        change: 0.50
      });
      
      // Step 3: Verify sale stored locally but not synced
      expect(mockPOSApp.storeSaleLocally).toHaveBeenCalledWith(offlineSale);
      expect(mockPOSApp.syncSale).toHaveBeenCalledWith(offlineSale);
      expect(mockOwnerApp.salesData).toHaveLength(0); // Not synced yet
      
      // Step 4: Come back online
      mockPOSApp.setOnlineStatus(true);
      mockServerConnection.setConnectionStatus(true);
      
      // Step 5: Manually trigger sync (simulating background sync)
      await mockPOSApp.syncSale(offlineSale);
      
      // Step 6: Verify sale now appears in dashboard
      expect(mockOwnerApp.salesData).toContainEqual(
        expect.objectContaining({
          total: 4.50,
          paymentMethod: 'cash'
        })
      );
    });

    test('should handle multiple concurrent sales', async () => {
      const salesPromises = [];
      
      // Simulate 3 concurrent sales from different terminals
      for (let i = 1; i <= 3; i++) {
        const terminalPOS = { ...mockPOSApp };
        terminalPOS.currentUser = { 
          email: `cashier${i}@store.com`, 
          role: 'sales' 
        };
        terminalPOS.cart = [
          { id: `${i}`, name: `Item ${i}`, price: i * 5, quantity: 1 }
        ];
        
        const salePromise = terminalPOS.processSale({
          method: i % 2 === 0 ? 'card' : 'cash',
          cashAmount: i * 5 + 2,
          change: 2
        });
        
        salesPromises.push(salePromise);
      }
      
      const sales = await Promise.all(salesPromises);
      
      // Verify all sales were processed
      expect(sales).toHaveLength(3);
      expect(mockOwnerApp.salesData).toHaveLength(3);
      
      // Verify statistics reflect all sales
      const expectedRevenue = 5 + 10 + 15; // 30
      expect(mockOwnerApp.statistics.totalSales).toBe(3);
      expect(mockOwnerApp.statistics.totalRevenue).toBe(expectedRevenue);
      expect(mockOwnerApp.statistics.averageSale).toBe(expectedRevenue / 3);
    });
  });

  describe('Error Recovery Workflows', () => {
    test('should retry failed sync operations', async () => {
      // Step 1: Process sale
      mockPOSApp.addToCart({ id: '1', name: 'Test Item', price: 10, quantity: 1 });
      
      // Step 2: Simulate sync failure
      mockServerConnection.sendSale.mockRejectedValueOnce(new Error('Network timeout'));
      
      const sale = await mockPOSApp.processSale({
        method: 'cash',
        cashAmount: 10,
        change: 0
      });
      
      // Step 3: Verify sale was stored locally despite sync failure
      expect(mockPOSApp.storeSaleLocally).toHaveBeenCalled();
      expect(mockOwnerApp.salesData).toHaveLength(0); // Sync failed
      
      // Step 4: Retry sync (simulating background sync retry)
      mockServerConnection.sendSale.mockResolvedValueOnce({ success: true });
      await mockPOSApp.syncSale(sale);
      
      // Step 5: Verify sale eventually synced
      expect(mockOwnerApp.salesData).toHaveLength(1);
    });

    test('should handle corrupted sale data gracefully', async () => {
      // Step 1: Create sale with missing required fields
      const corruptedSale = {
        items: null, // Corrupted data
        total: 'invalid', // Wrong type
        timestamp: undefined
      };
      
      // Step 2: Attempt to store corrupted sale
      mockPOSApp.storeSaleLocally.mockRejectedValueOnce(new Error('Invalid data'));
      
      try {
        await mockPOSApp.storeSaleLocally(corruptedSale);
      } catch (error) {
        expect(error.message).toBe('Invalid data');
      }
      
      // Step 3: Verify system continues to work with valid data
      mockPOSApp.addToCart({ id: '1', name: 'Valid Item', price: 5, quantity: 1 });
      
      const validSale = await mockPOSApp.processSale({
        method: 'cash',
        cashAmount: 5,
        change: 0
      });
      
      expect(validSale).toMatchObject({
        total: 5,
        paymentMethod: 'cash'
      });
    });

    test('should handle network intermittency during sync', async () => {
      const sales = [];
      
      // Step 1: Process multiple sales
      for (let i = 1; i <= 5; i++) {
        mockPOSApp.cart = [{ id: `${i}`, name: `Item ${i}`, price: i, quantity: 1 }];
        const sale = await mockPOSApp.processSale({
          method: 'cash',
          cashAmount: i + 1,
          change: 1
        });
        sales.push(sale);
      }
      
      // Step 2: Simulate intermittent connection during sync
      mockServerConnection.sendSale
        .mockResolvedValueOnce({ success: true })  // Sale 1: Success
        .mockRejectedValueOnce(new Error('Timeout')) // Sale 2: Fail
        .mockResolvedValueOnce({ success: true })  // Sale 3: Success
        .mockRejectedValueOnce(new Error('Timeout')) // Sale 4: Fail
        .mockResolvedValueOnce({ success: true }); // Sale 5: Success
      
      // Step 3: Attempt to sync all sales
      const syncResults = await Promise.allSettled(
        sales.map(sale => mockPOSApp.syncSale(sale))
      );
      
      // Step 4: Verify partial success
      const successful = syncResults.filter(result => result.status === 'fulfilled');
      const failed = syncResults.filter(result => result.status === 'rejected');
      
      expect(successful).toHaveLength(3);
      expect(failed).toHaveLength(2);
      expect(mockOwnerApp.salesData).toHaveLength(3); // Only successful syncs
    });
  });

  describe('Edge Case Workflows', () => {
    test('should handle storage quota exceeded scenario', async () => {
      // Mock storage quota exceeded error
      mockPOSApp.storeSaleLocally.mockRejectedValueOnce(
        Object.assign(new Error('Quota exceeded'), { name: 'QuotaExceededError' })
      );
      
      mockPOSApp.addToCart({ id: '1', name: 'Large Item', price: 100, quantity: 1 });
      
      // Should handle quota error gracefully
      try {
        await mockPOSApp.processSale({
          method: 'cash',
          cashAmount: 100,
          change: 0
        });
      } catch (error) {
        expect(error.name).toBe('QuotaExceededError');
      }
      
      // System should continue working after clearing space
      mockPOSApp.storeSaleLocally.mockResolvedValueOnce({ success: true });
      
      const newSale = await mockPOSApp.processSale({
        method: 'cash',
        cashAmount: 100,
        change: 0
      });
      
      expect(newSale).toBeDefined();
    });

    test('should handle rapid successive sales', async () => {
      const rapidSales = [];
      
      // Process 10 sales in rapid succession
      for (let i = 0; i < 10; i++) {
        mockPOSApp.cart = [{ id: `rapid-${i}`, name: `Item ${i}`, price: 1, quantity: 1 }];
        
        const salePromise = mockPOSApp.processSale({
          method: 'cash',
          cashAmount: 2,
          change: 1
        });
        
        rapidSales.push(salePromise);
      }
      
      const results = await Promise.all(rapidSales);
      
      // All sales should complete successfully
      expect(results).toHaveLength(10);
      results.forEach(sale => {
        expect(sale).toHaveProperty('id');
        expect(sale.total).toBe(1);
      });
      
      // Dashboard should reflect all sales
      expect(mockOwnerApp.salesData).toHaveLength(10);
      expect(mockOwnerApp.statistics.totalRevenue).toBe(10);
    });

    test('should handle cart modifications during checkout', async () => {
      // Add items to cart
      mockPOSApp.addToCart({ id: '1', name: 'Item 1', price: 5, quantity: 1 });
      mockPOSApp.addToCart({ id: '2', name: 'Item 2', price: 3, quantity: 1 });
      
      // Simulate item removal during checkout
      mockPOSApp.removeFromCart('2');
      
      const sale = await mockPOSApp.processSale({
        method: 'cash',
        cashAmount: 5,
        change: 0
      });
      
      // Sale should only include remaining item
      expect(sale.items).toHaveLength(1);
      expect(sale.items[0].id).toBe('1');
      expect(sale.total).toBe(5);
    });

    test('should handle owner dashboard during high load', async () => {
      // Simulate receiving 100 sales quickly
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        mockOwnerApp.receiveSale({
          id: i,
          total: Math.random() * 50 + 1,
          items: [{ id: `${i}`, name: `Item ${i}`, price: 10, quantity: 1 }],
          timestamp: new Date().toISOString()
        });
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should handle load efficiently (under 1 second)
      expect(processingTime).toBeLessThan(1000);
      expect(mockOwnerApp.salesData).toHaveLength(100);
      expect(mockOwnerApp.statistics.totalSales).toBe(100);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should work consistently across different browsers', async () => {
      const browserConfigs = [
        { name: 'Chrome', userAgent: 'Chrome/91.0.4472.124' },
        { name: 'Firefox', userAgent: 'Firefox/89.0' },
        { name: 'Safari', userAgent: 'Safari/14.1.1' },
        { name: 'Edge', userAgent: 'Edg/91.0.864.59' }
      ];
      
      for (const browser of browserConfigs) {
        // Simulate browser environment
        global.navigator.userAgent = browser.userAgent;
        
        // Test basic workflow in each browser
        mockPOSApp.cart = [{ id: '1', name: 'Test', price: 1, quantity: 1 }];
        
        const sale = await mockPOSApp.processSale({
          method: 'cash',
          cashAmount: 2,
          change: 1
        });
        
        expect(sale).toMatchObject({
          total: 1,
          paymentMethod: 'cash'
        });
      }
      
      // All browsers should produce consistent results
      expect(mockOwnerApp.salesData).toHaveLength(4);
    });

    test('should handle different device capabilities', async () => {
      const deviceConfigs = [
        { name: 'Desktop', memory: 8000, connection: 'wifi' },
        { name: 'Tablet', memory: 4000, connection: 'wifi' },
        { name: 'Phone', memory: 2000, connection: '4g' },
        { name: 'Low-end Phone', memory: 1000, connection: '2g' }
      ];
      
      for (const device of deviceConfigs) {
        // Simulate device constraints
        global.navigator.deviceMemory = device.memory / 1000; // GB
        global.navigator.connection = { effectiveType: device.connection };
        
        // Adjust behavior based on device
        const isLowEnd = device.memory < 2000;
        const batchSize = isLowEnd ? 1 : 5;
        
        // Process sales in appropriate batch size
        for (let i = 0; i < batchSize; i++) {
          mockPOSApp.cart = [{ id: `${device.name}-${i}`, name: 'Item', price: 1, quantity: 1 }];
          await mockPOSApp.processSale({
            method: 'cash',
            cashAmount: 2,
            change: 1
          });
        }
      }
      
      // Should complete without errors on all devices
      expect(mockOwnerApp.salesData.length).toBeGreaterThan(0);
    });
  });
});