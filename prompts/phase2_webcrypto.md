# Phase 2: WebCrypto Wrappers & Message Envelope

## Detailed Prompt for AI Agent
Implement WebCrypto API wrappers for encryption, decryption, and digital signatures. Create the message envelope specification with canonical JSON formatting. Build the cryptographic foundation for secure message exchange between POS and Owner terminals. **TDD Step**: Write comprehensive unit tests for all crypto operations, message envelope creation/validation, and signature verification before implementation. **Principles**: Ensure cryptographic security, performance efficiency, and cross-browser compatibility.

## Acceptance Criteria
- WebCrypto wrappers: sign(), verify(), encrypt(), decrypt() functions
- Message envelope: Canonical JSON with id, type, from, to, timestamp, nonce, payload, sig, pub
- Key management: Generate and store X25519/Ed25519 keypairs in IndexedDB
- Signature verification: Validate message authenticity and integrity
- Encryption/decryption: AES-GCM for payload protection
- Replay protection: Timestamp + nonce validation (±10min skew)
- Performance: Crypto operations complete in <500ms on low-end devices
- Browser compatibility: Fallback for browsers without WebCrypto
- Unit tests pass for all crypto and envelope operations

## Edge Cases
- WebCrypto unavailable: Graceful degradation with user notification
- Key generation failures: Retry logic and error recovery
- Invalid signatures: Proper error handling and logging
- Timestamp skew: Configurable tolerance for clock differences
- Large payloads: Efficient chunking for encryption
- Key rotation: Handle old key validation during transitions
- Memory constraints: Stream processing for large data

## Demo Requirements
- Showcase keypair generation and storage
- Demonstrate message signing and verification
- Display encryption/decryption of sample payloads
- Show envelope creation and validation
- Present performance benchmarks for crypto operations
- Demonstrate replay protection mechanisms

## Technical Implementation
- **Crypto Wrappers**:
  ```javascript
  // Promise-based API
  cryptoWrapper.sign(message, privateKey)
  cryptoWrapper.verify(message, signature, publicKey)
  cryptoWrapper.encrypt(plaintext, sharedSecret)
  cryptoWrapper.decrypt(ciphertext, sharedSecret)
  ```
- **Message Envelope**:
  ```javascript
  const envelope = {
    id: uuidv4(),
    type: 'SALE' | 'ACK' | 'CONFIG',
    from: deviceId,
    to: deviceId | 'broadcast',
    timestamp: new Date().toISOString(),
    nonce: generateNonce(),
    payload: base64Ciphertext,
    sig: base64Signature,
    pub: base64PublicKey
  };
  ```
- **Canonical JSON**: Consistent key ordering, no whitespace
- **Key Storage**: Secure IndexedDB storage with metadata
- **Error Handling**: Detailed error messages for debugging
