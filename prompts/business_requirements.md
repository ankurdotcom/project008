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
