# 📄 Requirement Document: Offline-First POS ↔ Owner Terminal System

## 🧭 Overview

A resilient, mobile-first system enabling secure, asynchronous communication between POS terminals and Owner terminals. Designed for low-bandwidth environments, offline operation, and deployment as a Progressive Web App (PWA), with no central server or recurring operational costs.

---

## ✅ Functional Requirements

### POS Terminal
- Capture and locally store sales data.
- Encrypt and sign each sales message.
- Queue messages for delivery.
- Detect network availability and initiate sync.
- Retry delivery until ACK received.
- Apply config updates from Owner terminal.
- Perform daily cleanup of delivered messages.

### Owner Terminal
- Receive and decrypt sales messages.
- Verify message authenticity.
- Send signed ACKs to POS terminals.
- Broadcast config updates to all or selected POS terminals.
- Store received data locally and render dashboard.
- Track delivery status and terminal health.

---

## 🚫 Non-Functional Requirements

- **Offline-first**: Full functionality without network.
- **Cross-platform**: Mobile browser (primary), desktop browser (optional).
- **Zero OPEX**: No paid servers, cloud, or relay infrastructure.
- **Low latency**: Optimized for small payloads and intermittent connectivity.
- **Scalable**: Supports multiple POS terminals without central coordination.
- **Privacy-preserving**: No metadata leakage beyond transport layer.

---

## 🔐 Security Model

- **End-to-end encryption** using WebCrypto (e.g., X25519 + AES-GCM).
- **Message signing** with POS/Owner private keys.
- **Replay protection** via timestamp + nonce.
- **ACK verification**: Owner signs ACKs; POS verifies before cleanup.
- **Config integrity**: Versioned updates signed by Owner.

---

## 🔄 Data Flow Diagrams

### POS → Owner (Sales Message)

```plaintext
[POS Terminal]
  ↓ (Encrypt + Sign)
[Local Queue]
  ↓ (Network Available)
[WebRTC or Relay]
  ↓
[Owner Terminal]
  ↓ (Decrypt + Verify)
[Local DB + Dashboard]
  ↓
[ACK → POS]
```

### Owner → POS (Config Update)

```plaintext
[Owner Terminal]
  ↓ (Encrypt + Sign)
[WebRTC or Relay]
  ↓
[POS Terminal]
  ↓ (Decrypt + Verify)
[Apply Config]
```

---

## 🧰 Technology Stack

| Layer | Technology |
|-------|------------|
| UI | HTML, CSS, JS (PWA-ready) |
| Storage | IndexedDB (POS + Owner) |
| Crypto | WebCrypto API |
| Transport | WebRTC (DataChannel), Signal/Session/Matrix (fallback) |
| Sync | Service Workers + Background Sync |
| Queue | Local message queue with retry logic |
| Dashboard | JS-based visualization (Owner terminal) |

---

## 🧪 Validation Plan

| Phase | Module | Test |
|-------|--------|------|
| 1 | POS Queue | Offline sales capture and local storage |
| 2 | Encryption | WebCrypto signing + encryption |
| 3 | Sync Logic | Retry on reconnect, fallback routing |
| 4 | ACK Handling | Signed ACK verification |
| 5 | Cleanup | Daily purge of confirmed messages |
| 6 | Config Update | Owner broadcast + POS application |
| 7 | Dashboard | Render sales data and terminal status |

---

## 🚀 Deployment Strategy

- Package as a **Progressive Web App (PWA)**:
  - Installable on mobile and desktop
  - Offline caching via Service Workers
- Distribute via:
  - QR code
  - Direct link
  - USB sideload (for fully offline environments)
- No backend server required post-deployment.

---

## ✨ Optional Enhancements

- **Merkle tree integrity checks** for batch validation.
- **Status tracker** for POS terminals (last sync, config version).
- **Shell scripts** for onboarding new POS devices.
- **Config rollback** using version history.
- **Audit trail** for message delivery and cleanup.
- **Modular transport wrapper** to abstract WebRTC vs relay logic.

---

## 📋 Implementation Roadmap (MVP Priority)

1. **MVP POS Queue & Local Storage**: IndexedDB schema + simple UI to view queue
2. **WebCrypto Wrappers**: Signing/encrypt/decrypt functions + message envelope spec
3. **Owner Terminal Basics**: Decrypt/verify + ACK generation
4. **WebRTC Transport**: Direct channel + QR/USB fallback signaling
5. **Service Worker Sync**: Background sync and retry/backoff logic
6. **Dashboard & Status**: Owner dashboard + terminal health tracking
7. **Testing & PWA**: Unit tests, PWA manifest, onboarding scripts

---

## 🔧 Data & Message Models

### Message Envelope (Canonical JSON)
```json
{
  "id": "<uuidv4>",
  "type": "SALE" | "ACK" | "CONFIG",
  "from": "<device-id>",
  "to": "<device-id|broadcast>",
  "timestamp": "<ISO8601>",
  "nonce": "<base64-or-uuid>",
  "payload": "<base64-ciphertext>",
  "sig": "<base64-signature>",
  "pub": "<base64-sender-public-key>"
}
```

### Sale Payload
```json
{
  "saleId": "<uuid>",
  "items": [{"id": "string", "name": "string", "price": "number", "quantity": "number"}],
  "subtotal": "number",
  "total": "number",
  "paymentMethod": "cash"|"card",
  "processedBy": "<masked-email-or-device-id>",
  "deviceTime": "<ISO8601>"
}
```

### ACK Payload
```json
{
  "messageId": "<id-of-sale-message>",
  "status": "RECEIVED",
  "ownerId": "<device-id>",
  "timestamp": "<ISO8601>"
}
```

### Config Payload
```json
{
  "configVersion": "number",
  "settings": {"key": "value"},
  "notes": "string"
}
```

---

## 🔑 Crypto & Key Management

- **Key Types**: Long-term identity keypair (X25519/Ed25519) per device
- **Signing**: Ed25519 for authenticity on envelope-level
- **Encryption**: Ephemeral session keys via X25519 for AES-GCM
- **Replay Protection**: Timestamp ± 10min skew + nonce table per device
- **Key Rotation**: Owner-issued signed rotation message

---

## 📊 Storage Schema (IndexedDB)

- **Database**: pos-sync-v1
- **stores.messages**: `{id, envelope, state, attempts, lastAttemptAt, locked}`
- **stores.keys**: `{identityKey, pubKey, metadata}`
- **stores.config**: `{version, appliedAt}`
- **stores.audit**: Append-only audit trail

---

## 📖 Operational Runbook

### Provisioning Flows
- Owner generates identity keypair, exports QR with public key + token
- POS scans QR, stores Owner public key, creates own identity key
- Offline onboarding via USB or printed QR

### Recovery
- Export/import encrypted IndexedDB backup (AES-GCM with password)

---

## ✅ Acceptance Criteria

- **Offline Capture**: Record sales offline; persist through power cycles
- **Delivery & ACK**: Queued sales receive valid signed ACK within 2 minutes on reliable network
- **Data Integrity**: Owner verifies signature and decrypts payload; rejects tampered data
- **Replay Protection**: Duplicate messageId/nonce ignored and logged
- **Config Application**: Owner broadcasts applied only if signature valid and version newer
- **Performance**: <2KB per sale payload; 100 messages sync in <30s over poor mobile link
- **Privacy**: No GPS metadata leaked by default

---

## 🛡️ Threat Model & Mitigations

- **MITM**: End-to-end encryption + public key pinning
- **Device Compromise**: Encrypted key storage + manual revocation
- **Replay**: Nonce + timestamp validation
- **Rogue Owner**: ACL + optional multi-owner model
- **Logging**: Security events to local audit (no plaintext sensitive data)

---

## 🧪 Testing Strategy

- **Unit Tests**: WebCrypto wrappers, IndexedDB operations, message canonicalization
- **Integration Tests**: Headless browser simulation of offline capture + sync
- **Manual Tests**: QR onboarding, USB import/export, conflict resolution
- **CI Gating**: Crypto + queue persistence tests

---

## 📚 Onboarding & Contributor Guide

- **README**: Architecture, quick start, PWA install steps
- **CONTRIBUTORS.md**: Coding style, linting, tests, integration simulation
- **provisioning.md**: Keypair generation, QR format, key export/import
- **Sample Scripts**: `generate-provision-qr.js`, `simulate-rtc-session.js`
