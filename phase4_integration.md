# Phase 4: Integration and Sync Mechanisms

## Detailed Prompt for AI Agent
Integrate POS and Owner apps with email broadcasting for updates, sync mechanisms, and data flow. Implement owner-controlled updates (item prices/categories) broadcasted to terminals. Ensure seamless sync over intermittent/slow internet. Use debugging tracker to avoid past integration issues.

## Acceptance Criteria
- Owner updates broadcast via email to all terminals.
- Terminals receive and apply updates instantly.
- Sync handles offline queues and retries.
- Data consistency across devices.
- No data loss during sync failures.

## Edge Cases
- Email delays: Handle out-of-order updates.
- Network drops: Resume sync on reconnection.
- Conflicting updates: Last-write-wins or manual resolution.
- High volume: Batch emails to avoid limits.
- Device offline long-term: Sync on next connection.
- Auth token expiry: Auto-refresh Google tokens.
- Mixed internet types: WiFi to mobile data transitions.

## Next Steps
Proceed to Phase 5 after integration is complete.
