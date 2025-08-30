# Phase 6: Testing & PWA Deployment

## Detailed Prompt for AI Agent
Conduct comprehensive testing across all modules and deploy as Progressive Web Apps. Test on low-end devices, intermittent connectivity, and cross-browser compatibility. Implement PWA features, service workers, and offline caching. **TDD Step**: Ensure all tests pass with 80%+ coverage; write E2E tests for complete user workflows. **Principles**: Achieve zero bugs through rigorous testing, optimize for PWA performance, and ensure seamless offline/online operation.

## Acceptance Criteria
- Unit tests: 80%+ coverage for all crypto, storage, and transport modules
- Integration tests: End-to-end message flow from POS to Owner
- E2E tests: Complete sales transaction with sync and ACK
- PWA features: Installable, offline caching, background sync
- Cross-browser: Chrome, Firefox, Safari, Edge compatibility
- Performance: Lighthouse scores >90, load times <2s
- Offline testing: Full functionality without network
- Security testing: WebCrypto operations, key storage validation
- Accessibility: WCAG AA compliance
- Deployment: QR code distribution, USB sideload capability

## Edge Cases
- Low-end devices: Test on 1GB RAM devices with slow CPUs
- Intermittent connectivity: 2G speeds, frequent disconnections
- Storage limits: Handle IndexedDB quota exceeded
- WebCrypto unavailable: Graceful fallback for older browsers
- PWA installation: Handle installation failures and updates
- Background sync: Test Service Worker reliability
- Multi-tab usage: Handle concurrent access to IndexedDB
- Power management: Test with battery optimization enabled

## Demo Requirements
- Present complete test suite execution with coverage reports
- Demonstrate PWA installation and offline functionality
- Show cross-browser compatibility testing
- Display performance benchmarks and Lighthouse scores
- Showcase E2E workflow testing
- Demonstrate deployment via QR code and USB

## Technical Implementation
- **Test Strategy**:
  ```javascript
  // Unit Tests
  describe('CryptoWrapper', () => {
    test('should sign and verify messages')
    test('should encrypt and decrypt payloads')
  });

  // Integration Tests
  describe('MessageFlow', () => {
    test('POS to Owner message delivery')
    test('ACK verification and cleanup')
  });

  // E2E Tests
  describe('CompleteWorkflow', () => {
    test('Sale → Queue → Sync → ACK → Dashboard')
  });
  ```
- **PWA Configuration**:
  ```json
  // manifest.json
  {
    "name": "Offline POS System",
    "short_name": "POS",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2196f3"
  }
  ```
- **Service Worker**: Cache static assets, handle background sync
- **Testing Tools**: Jest for unit, Cypress for E2E, Lighthouse CI
- **Deployment**: GitHub Pages, Netlify, or self-hosted with QR generation
