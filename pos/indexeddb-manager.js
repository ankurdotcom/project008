/**
 * IndexedDB Storage Manager for Offline-First POS System
 * Implements Phase 1: POS Queue & Local Storage requirements
 */

class IndexedDBManager {
    constructor() {
        this.dbName = 'pos-sync-v1';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize IndexedDB database with required stores
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ IndexedDB initialization failed:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 Upgrading IndexedDB schema...');

                // Messages store: {id, envelope, state, attempts, lastAttemptAt, locked}
                if (!db.objectStoreNames.contains('messages')) {
                    const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
                    messagesStore.createIndex('state', 'state', { unique: false });
                    messagesStore.createIndex('timestamp', 'envelope.timestamp', { unique: false });
                    console.log('📦 Created messages store');
                }

                // Keys store: {identityKey, pubKey, metadata}
                if (!db.objectStoreNames.contains('keys')) {
                    const keysStore = db.createObjectStore('keys', { keyPath: 'id' });
                    keysStore.createIndex('type', 'type', { unique: false });
                    console.log('🔑 Created keys store');
                }

                // Config store: {version, appliedAt}
                if (!db.objectStoreNames.contains('config')) {
                    db.createObjectStore('config', { keyPath: 'key' });
                    console.log('⚙️ Created config store');
                }

                // Audit store: append-only audit trail
                if (!db.objectStoreNames.contains('audit')) {
                    const auditStore = db.createObjectStore('audit', { keyPath: 'id', autoIncrement: true });
                    auditStore.createIndex('timestamp', 'timestamp', { unique: false });
                    auditStore.createIndex('event', 'event', { unique: false });
                    console.log('📊 Created audit store');
                }
            };
        });
    }

    /**
     * Ensure database is initialized
     */
    async ensureInit() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    /**
     * Store a sales transaction in IndexedDB
     */
    async storeSale(saleData) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');

            // Create message envelope
            const envelope = {
                id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'SALE',
                from: 'pos_terminal',
                to: 'owner_terminal',
                timestamp: new Date().toISOString(),
                nonce: this.generateNonce(),
                payload: JSON.stringify(saleData),
                state: 'QUEUED',
                attempts: 0,
                lastAttemptAt: null,
                locked: false,
                createdAt: new Date().toISOString()
            };

            const request = store.add(envelope);

            request.onsuccess = () => {
                console.log('💰 Sale stored in IndexedDB:', envelope.id);
                this.logAuditEvent('SALE_STORED', { saleId: envelope.id, amount: saleData.total });
                resolve(envelope);
            };

            request.onerror = () => {
                console.error('❌ Failed to store sale:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Retrieve all queued messages
     */
    async getQueuedMessages() {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('state');
            const request = index.getAll('QUEUED');

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('❌ Failed to retrieve queued messages:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Update message state
     */
    async updateMessageState(messageId, newState, additionalData = {}) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const request = store.get(messageId);

            request.onsuccess = () => {
                const message = request.result;
                if (message) {
                    message.state = newState;
                    message.lastAttemptAt = new Date().toISOString();
                    message.attempts = (message.attempts || 0) + 1;
                    Object.assign(message, additionalData);

                    const updateRequest = store.put(message);
                    updateRequest.onsuccess = () => {
                        console.log(`📝 Message ${messageId} state updated to ${newState}`);
                        resolve(message);
                    };
                    updateRequest.onerror = () => {
                        console.error('❌ Failed to update message state:', updateRequest.error);
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error(`Message ${messageId} not found`));
                }
            };

            request.onerror = () => {
                console.error('❌ Failed to get message for update:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all sales data for dashboard
     */
    async getAllSales() {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const request = store.getAll();

            request.onsuccess = () => {
                const sales = request.result
                    .filter(msg => msg.type === 'SALE')
                    .map(msg => ({
                        ...JSON.parse(msg.payload),
                        id: msg.id,
                        state: msg.state,
                        timestamp: msg.timestamp,
                        syncStatus: msg.state
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                resolve(sales);
            };

            request.onerror = () => {
                console.error('❌ Failed to retrieve sales:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get sales statistics
     */
    async getSalesStats() {
        const sales = await this.getAllSales();

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Get today's sales
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(sale =>
            sale.timestamp.startsWith(today)
        );
        const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);

        // Get top selling items
        const itemSales = {};
        sales.forEach(sale => {
            if (sale.items) {
                sale.items.forEach(item => {
                    if (!itemSales[item.name]) {
                        itemSales[item.name] = { quantity: 0, revenue: 0 };
                    }
                    itemSales[item.name].quantity += item.quantity || 0;
                    itemSales[item.name].revenue += (item.price || 0) * (item.quantity || 0);
                });
            }
        });

        const topItems = Object.entries(itemSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            totalSales,
            totalRevenue,
            averageSale,
            todaySales: todaySales.length,
            todayRevenue,
            topItems
        };
    }

    /**
     * Store cryptographic keys
     */
    async storeKey(keyData) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['keys'], 'readwrite');
            const store = transaction.objectStore('keys');

            const keyRecord = {
                id: keyData.id || `key_${Date.now()}`,
                type: keyData.type || 'identity',
                publicKey: keyData.publicKey,
                privateKey: keyData.privateKey, // In production, this should be encrypted
                metadata: keyData.metadata || {},
                createdAt: new Date().toISOString()
            };

            const request = store.add(keyRecord);

            request.onsuccess = () => {
                console.log('🔑 Key stored in IndexedDB:', keyRecord.id);
                resolve(keyRecord);
            };

            request.onerror = () => {
                console.error('❌ Failed to store key:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get stored keys
     */
    async getKeys(type = null) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['keys'], 'readonly');
            const store = transaction.objectStore('keys');

            let request;
            if (type) {
                const index = store.index('type');
                request = index.getAll(type);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('❌ Failed to retrieve keys:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Store configuration
     */
    async storeConfig(key, value) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['config'], 'readwrite');
            const store = transaction.objectStore('config');

            const configRecord = {
                key,
                value,
                updatedAt: new Date().toISOString()
            };

            const request = store.put(configRecord);

            request.onsuccess = () => {
                console.log('⚙️ Config stored:', key);
                resolve(configRecord);
            };

            request.onerror = () => {
                console.error('❌ Failed to store config:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get configuration
     */
    async getConfig(key) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['config'], 'readonly');
            const store = transaction.objectStore('config');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => {
                console.error('❌ Failed to get config:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Log audit event
     */
    async logAuditEvent(event, details) {
        await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['audit'], 'readwrite');
            const store = transaction.objectStore('audit');

            const auditRecord = {
                timestamp: new Date().toISOString(),
                event,
                details,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            const request = store.add(auditRecord);

            request.onsuccess = () => {
                console.log('📊 Audit event logged:', event);
                resolve(auditRecord);
            };

            request.onerror = () => {
                console.error('❌ Failed to log audit event:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Clear all data (for testing/reset)
     */
    async clearAllData() {
        await this.ensureInit();

        const stores = ['messages', 'keys', 'config', 'audit'];

        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    console.log(`🗑️ Cleared ${storeName} store`);
                    resolve();
                };

                request.onerror = () => {
                    console.error(`❌ Failed to clear ${storeName}:`, request.error);
                    reject(request.error);
                };
            });
        }
    }

    /**
     * Generate a random nonce
     */
    generateNonce() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Check if IndexedDB is supported
     */
    static isSupported() {
        return typeof window !== 'undefined' &&
               'indexedDB' in window &&
               'IDBKeyRange' in window;
    }

    /**
     * Get storage usage estimate
     */
    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return await navigator.storage.estimate();
        }
        return { usage: 0, quota: 0 };
    }
}

// Create and export singleton instance
const indexedDBManager = new IndexedDBManager();

// Make it available globally for the web application
if (typeof window !== 'undefined') {
    window.indexedDBManager = indexedDBManager;
    console.log('✅ IndexedDB Manager loaded and available globally');
}

// End of file - no export statements
console.log('🎯 IndexedDB Manager initialization complete');
