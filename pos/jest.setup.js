// Simple setup for testing core functionality

// Setup global mocks for browser environment
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

// Mock browser APIs for testing
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (test)',
    onLine: true,
    serviceWorker: {
      register: jest.fn(() => Promise.resolve({
        sync: { register: jest.fn() },
        update: jest.fn(),
        unregister: jest.fn()
      }))
    }
  },
  writable: true
});

// Mock Web APIs
global.fetch = jest.fn();
global.Response = jest.fn();
global.Request = jest.fn();
global.Headers = jest.fn();

// Mock crypto for tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    subtle: {
      generateKey: jest.fn(),
      exportKey: jest.fn(),
      importKey: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      digest: jest.fn()
    }
  },
  writable: true
});

// Mock console methods to avoid noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
