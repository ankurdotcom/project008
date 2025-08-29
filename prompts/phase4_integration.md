# Phase 4: Integration and Sync Mechanisms

## Detailed Prompt for AI Agent
Integrate POS and Owner apps with email broadcasting for updates, sync mechanisms, and data flow. Implement owner-controlled updates (item prices/categories) broadcasted to terminals. Ensure seamless sync over intermittent/slow internet. Use debugging tracker to avoid past integration issues. **TDD Step**: Write integration tests for email broadcasting and sync before implementing the integration logic. **Principles**: Focus on fast integration (modular APIs), high quality (robust error handling), and maintainable code (clear separation of concerns).

## Acceptance Criteria
- Owner updates broadcast via email to all terminals.
- Terminals receive and apply updates instantly.
- Sync handles offline queues and retries.
- Data consistency across devices.
- Performance: Efficient sync without performance degradation.
- UX: Seamless updates without user disruption.
- Integration tests pass for sync and broadcasting.
- No data loss or corruption during sync failures.
- Zero integration bugs.

## Edge Cases
- Email delays: Handle out-of-order updates.
- Network drops: Resume sync on reconnection.
- Conflicting updates: Last-write-wins or manual resolution.
- High volume: Batch emails to avoid limits.
- Device offline long-term: Sync on next connection.
- Auth token expiry: Auto-refresh Google tokens.
- Mixed internet types: WiFi to mobile data transitions.

## Demo Requirements
- Demonstrate owner updating item prices/categories via app.
- Show email broadcast to POS terminals and instant updates.
- Display seamless sync across devices (online/offline transitions).
- Present data consistency and duplicate handling.
- Showcase retry mechanisms for failed syncs.
