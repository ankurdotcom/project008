/**
 * Test suite for IndexedDB Storage Implementation
 * Tests Phase 1: POS Queue & Local Storage functionality
 */

class IndexedDBTests {
    constructor() {
        this.dbManager = null;
        this.testResults = [];
    }

    async init() {
        // Wait for IndexedDB manager to be available
        while (!window.indexedDBManager) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.dbManager = window.indexedDBManager;
    }

    log(message, passed = null) {
        const timestamp = new Date().toLocaleTimeString();
        const status = passed === null ? 'INFO' : (passed ? '✅ PASS' : '❌ FAIL');
        console.log(`[${timestamp}] ${status}: ${message}`);
        this.testResults.push({ message, passed, timestamp });
    }

    async runAllTests() {
        console.log('🧪 Starting IndexedDB Storage Tests...');
        console.log('=' .repeat(50));

        try {
            // Test 1: IndexedDB Support
            this.testIndexedDBSupport();

            // Test 2: Database Initialization
            await this.testDatabaseInit();

            // Test 3: Store Sale Transaction
            await this.testStoreSale();

            // Test 4: Retrieve Sales Data
            await this.testRetrieveSales();

            // Test 5: Sales Statistics
            await this.testSalesStats();

            // Test 6: Message State Management
            await this.testMessageStates();

            // Test 7: Storage Performance
            await this.testPerformance();

            // Test 8: Error Handling
            await this.testErrorHandling();

        } catch (error) {
            this.log(`Test suite failed: ${error.message}`, false);
        }

        this.printSummary();
    }

    testIndexedDBSupport() {
        const supported = typeof window !== 'undefined' &&
                         'indexedDB' in window &&
                         'IDBKeyRange' in window;

        this.log('IndexedDB browser support', supported);

        if (!supported) {
            throw new Error('IndexedDB not supported in this browser');
        }
    }

    async testDatabaseInit() {
        try {
            await this.dbManager.init();
            this.log('Database initialization', true);
        } catch (error) {
            this.log(`Database initialization failed: ${error.message}`, false);
            throw error;
        }
    }

    async testStoreSale() {
        const testSale = {
            items: [
                { id: '1', name: 'Apple', price: 2.5, quantity: 2, total: 5 },
                { id: '2', name: 'Bread', price: 3, quantity: 1, total: 3 }
            ],
            subtotal: 8,
            total: 8,
            cashAmount: 10,
            change: 2,
            paymentMethod: 'cash',
            timestamp: new Date().toISOString(),
            processedBy: 'test@example.com',
            userRole: 'sales'
        };

        try {
            const storedMessage = await this.dbManager.storeSale(testSale);
            this.log('Store sale transaction', true);
            return storedMessage.id;
        } catch (error) {
            this.log(`Store sale failed: ${error.message}`, false);
            throw error;
        }
    }

    async testRetrieveSales() {
        try {
            const sales = await this.dbManager.getAllSales();
            const hasTestSale = sales.some(sale => sale.total === 8);
            this.log('Retrieve sales data', hasTestSale);

            if (!hasTestSale) {
                throw new Error('Test sale not found in retrieved data');
            }
        } catch (error) {
            this.log(`Retrieve sales failed: ${error.message}`, false);
            throw error;
        }
    }

    async testSalesStats() {
        try {
            const stats = await this.dbManager.getSalesStats();
            const hasRequiredFields = stats.hasOwnProperty('totalSales') &&
                                    stats.hasOwnProperty('totalRevenue') &&
                                    stats.hasOwnProperty('averageSale');

            this.log('Sales statistics calculation', hasRequiredFields);

            if (!hasRequiredFields) {
                throw new Error('Statistics missing required fields');
            }
        } catch (error) {
            this.log(`Sales stats failed: ${error.message}`, false);
            throw error;
        }
    }

    async testMessageStates() {
        try {
            // Store a test message
            const testSale = {
                items: [{ id: '1', name: 'Test Item', price: 1, quantity: 1, total: 1 }],
                subtotal: 1,
                total: 1,
                cashAmount: 2,
                change: 1,
                paymentMethod: 'cash',
                timestamp: new Date().toISOString(),
                processedBy: 'test@example.com',
                userRole: 'sales'
            };

            const storedMessage = await this.dbManager.storeSale(testSale);
            const messageId = storedMessage.id;

            // Test state update
            await this.dbManager.updateMessageState(messageId, 'SYNCED');
            const queuedMessages = await this.dbManager.getQueuedMessages();
            const messageStillQueued = queuedMessages.some(msg => msg.id === messageId);

            this.log('Message state management', !messageStillQueued);

            if (messageStillQueued) {
                throw new Error('Message state update failed');
            }
        } catch (error) {
            this.log(`Message states test failed: ${error.message}`, false);
            throw error;
        }
    }

    async testPerformance() {
        const startTime = Date.now();

        try {
            // Perform multiple operations
            for (let i = 0; i < 10; i++) {
                const testSale = {
                    items: [{ id: '1', name: `Item ${i}`, price: 1, quantity: 1, total: 1 }],
                    subtotal: 1,
                    total: 1,
                    cashAmount: 2,
                    change: 1,
                    paymentMethod: 'cash',
                    timestamp: new Date().toISOString(),
                    processedBy: 'test@example.com',
                    userRole: 'sales'
                };

                await this.dbManager.storeSale(testSale);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;
            const performanceOk = duration < 2000; // Should complete within 2 seconds

            this.log(`Performance test (10 operations: ${duration}ms)`, performanceOk);

            if (!performanceOk) {
                console.warn(`⚠️ Performance warning: ${duration}ms for 10 operations`);
            }
        } catch (error) {
            this.log(`Performance test failed: ${error.message}`, false);
            throw error;
        }
    }

    async testErrorHandling() {
        try {
            // Test invalid data handling
            await this.dbManager.storeSale(null);
            this.log('Error handling for invalid data', false);
            throw new Error('Should have rejected invalid data');
        } catch (error) {
            // Expected to fail
            this.log('Error handling for invalid data', true);
        }

        try {
            // Test non-existent message update
            await this.dbManager.updateMessageState('non-existent-id', 'SYNCED');
            this.log('Error handling for non-existent message', false);
            throw new Error('Should have rejected non-existent message');
        } catch (error) {
            // Expected to fail
            this.log('Error handling for non-existent message', true);
        }
    }

    printSummary() {
        console.log('\n' + '=' .repeat(50));
        console.log('🧪 TEST SUMMARY');
        console.log('=' .repeat(50));

        const passed = this.testResults.filter(r => r.passed === true).length;
        const failed = this.testResults.filter(r => r.passed === false).length;
        const total = this.testResults.length;

        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed === 0) {
            console.log('🎉 All tests passed! IndexedDB implementation is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the implementation.');
        }

        console.log('=' .repeat(50));
    }
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
    window.IndexedDBTests = IndexedDBTests;

    // Run tests after page load
    window.addEventListener('load', async () => {
        const tests = new IndexedDBTests();
        await tests.init();
        await tests.runAllTests();
    });
}
