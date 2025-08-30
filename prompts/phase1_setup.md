# Phase 1: POS Queue & Local Storage (IndexedDB)

## Detailed Prompt for AI Agent
Implement the core POS queue system with IndexedDB storage for offline-first sales data capture. Create the message queue infrastructure, local storage schema, and basic UI for viewing queued messages. Focus on reliable offline storage, queue management, and data persistence. **TDD Step**: Write unit tests for IndexedDB operations, queue management, and offline storage before implementation. **Principles**: Prioritize data integrity, performance on low-end devices, and seamless offline/online transitions.

## Acceptance Criteria
- IndexedDB schema implemented: `pos-sync-v1` with stores.messages, stores.keys, stores.config, stores.audit
- Message queue supports: add, retrieve, update, delete operations
- Offline sales capture: Store sales data locally when offline
- Queue persistence: Data survives app restarts and device power cycles
- Basic queue UI: Display queued messages with status indicators
- Performance: <100ms for queue operations on low-end devices
- Storage limits: Handle storage quota exceeded gracefully
- Unit tests pass for all queue operations
- No data loss during offline/online transitions

## Edge Cases
- Storage quota exceeded: Graceful degradation, user notification
- Device storage full: Prioritize critical data, cleanup old messages
- IndexedDB unavailable: Fallback to localStorage or in-memory storage
- Large queue: Efficient pagination and lazy loading
- Concurrent access: Handle multiple tabs/windows accessing queue
- Power interruption: Atomic operations for data integrity
- Browser compatibility: Fallback for older browsers without IndexedDB

## Demo Requirements
- Showcase offline sales capture and local storage
- Demonstrate queue persistence through app restart
- Display queue management UI with status indicators
- Show performance metrics for queue operations
- Present unit test execution and coverage

## Technical Implementation
- **IndexedDB Schema**:
  ```javascript
  // stores.messages: {id, envelope, state, attempts, lastAttemptAt, locked}
  // stores.keys: {identityKey, pubKey, metadata}
  // stores.config: {version, appliedAt}
  // stores.audit: append-only audit trail
  ```
- **Queue States**: QUEUED, SENDING, RETRY, ACKED, FAILED
- **Storage API**: Promise-based wrapper for IndexedDB operations
- **Queue Manager**: Singleton class handling all queue operations
- **Offline Detection**: navigator.onLine + periodic connectivity checks
