# Phase 3: Owner Terminal Basics & ACK System

## Detailed Prompt for AI Agent
Build the Owner terminal foundation with message reception, decryption, verification, and ACK generation. Implement the core Owner dashboard UI and terminal health tracking. Create the ACK verification system for secure message confirmation. **TDD Step**: Write integration tests for message processing pipeline and ACK generation/verification before implementation. **Principles**: Focus on security-first design, reliable message processing, and clear dashboard visualization.

## Acceptance Criteria
- Message reception: Receive and parse encrypted messages from POS terminals
- Decryption pipeline: Verify signatures and decrypt payloads
- ACK generation: Create signed ACK messages for received sales
- ACK verification: POS verifies Owner-signed ACKs before cleanup
- Owner dashboard: Basic UI showing received messages and terminal status
- Terminal health: Track connection status and message delivery
- Duplicate detection: Handle replay attacks and duplicate messages
- Error handling: Graceful failure recovery and user notifications
- Integration tests pass for end-to-end message flow

## Edge Cases
- Invalid signatures: Reject tampered messages with proper logging
- Duplicate messages: Detect and handle nonce/timestamp duplicates
- Clock skew: Handle timestamp differences between devices
- Network interruptions: Resume message processing on reconnection
- Large message volumes: Efficient batch processing and pagination
- Terminal offline: Track and display offline status
- Key mismatches: Handle key rotation and old key validation

## Demo Requirements
- Demonstrate message reception and decryption
- Show ACK generation and verification process
- Display Owner dashboard with message list
- Present terminal health monitoring
- Showcase duplicate detection and handling
- Demonstrate error recovery scenarios

## Technical Implementation
- **Message Processor**:
  ```javascript
  class MessageProcessor {
    async processMessage(envelope) {
      // Verify signature
      // Decrypt payload
      // Process by type (SALE/ACK/CONFIG)
      // Generate ACK if needed
      // Update dashboard
    }
  }
  ```
- **ACK System**:
  ```javascript
  const ackPayload = {
    messageId: envelope.id,
    status: 'RECEIVED',
    ownerId: ownerDeviceId,
    timestamp: new Date().toISOString()
  };
  ```
- **Dashboard Components**:
  - Message list with status indicators
  - Terminal health grid
  - Real-time sync status
  - Error logs and notifications
- **Storage Integration**: Store processed messages in IndexedDB
- **Health Monitoring**: Track last seen, message counts, error rates
