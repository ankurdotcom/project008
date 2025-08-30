# Development Principles for Offline-First POS ↔ Owner Terminal System

## Core Principles
This project prioritizes **fast development**, **high quality**, **easy maintenance**, **high performance**, **top-class user experience**, and **zero bugs**. These principles guide every decision in the development of our offline-first, mobile-native POS system with zero operational costs.

## Fast Development
- **TDD Approach**: Write tests first to clarify crypto and sync requirements early.
- **Modular Architecture**: Break down into small modules (POS Queue, WebCrypto, WebRTC Transport).
- **Reusable Components**: Build shared crypto utilities and message envelope handlers.
- **Automated Tools**: Use linters, formatters, and CI/CD for rapid crypto/security validation.
- **Incremental Phases**: Small phases from MVP queue to full PWA deployment.

## High Quality
- **Code Standards**: Follow ESLint, Prettier, and TypeScript for secure, error-free crypto code.
- **Security Reviews**: All crypto implementations peer-reviewed for WebCrypto best practices.
- **Documentation**: Comprehensive docs in `prompts/` and inline comments for crypto operations.
- **Version Control**: Git best practices with security-focused commits.

## Easy Maintenance
- **Clean Architecture**: Separation of UI, crypto, storage, and transport layers.
- **Modular Design**: Easy updates to transport (WebRTC) without affecting crypto layer.
- **Dependency Management**: Minimal, well-maintained crypto and PWA dependencies.
- **Knowledge Sharing**: Debugging tracker and phase docs for crypto implementation continuity.

## High Performance
- **Optimized for Low-End Devices**: Minimal bundle sizes, efficient IndexedDB operations.
- **Lazy Loading**: Load crypto modules and dashboard components on demand.
- **Caching**: Service workers for offline PWA, IndexedDB for message queue.
- **Efficient Algorithms**: Fast crypto operations, optimized message serialization.
- **Monitoring**: Performance metrics for crypto operations and sync latency.

## Top-Class User Experience
- **Responsive Design**: Works seamlessly on mobile browsers and desktops.
- **Offline-First**: Full POS functionality without network connectivity.
- **Intuitive UI**: Simple, touch-friendly interfaces for sales and dashboard.
- **Accessibility**: WCAG compliant for all users, including screen readers.
- **Feedback Loops**: Loading indicators, sync status, error messages for crypto operations.

## Zero Bugs
- **Comprehensive Testing**: 80%+ coverage with unit, integration, E2E crypto tests.
- **Edge Case Handling**: Test all scenarios (no WebCrypto, storage quota, network failures).
- **Debugging Tracker**: Learn from crypto implementation mistakes, prevent regressions.
- **Automated Testing**: Run tests on every commit, including crypto validation.
- **Bug Tracking**: Use issues for tracking crypto and sync bugs.

## Implementation Guidelines
- **Tech Stack Choice**: HTML/CSS/JS PWA for maximum compatibility and zero OPEX.
- **Best Practices**: WebCrypto API standards, IndexedDB best practices, Service Worker patterns.
- **Performance Budgets**: Set limits for bundle size, crypto operation times, sync latency.
- **Security First**: All crypto operations validated against known attacks (replay, MITM).
- **User Testing**: Regular UX testing on target mobile browsers and offline scenarios.
- **Continuous Improvement**: Retrospectives after each phase with crypto/security focus.

## Metrics for Success
- **Development Speed**: Complete phases within estimates with working crypto.
- **Quality**: Test pass rate, crypto operation success, code coverage.
- **Performance**: Lighthouse scores >90, crypto ops <500ms, sync <2s.
- **UX**: User satisfaction surveys, error rates <1%, offline functionality rating.
- **Bugs**: Zero critical bugs, especially in crypto and sync modules.

## Security Principles
- **Defense in Depth**: Multiple security layers (WebCrypto + message signing + transport encryption).
- **Privacy by Design**: No metadata leakage, encrypted storage, minimal data collection.
- **Zero Trust**: Verify all messages, validate all signatures, authenticate all operations.
- **Secure Defaults**: Encrypt everything by default, fail securely on errors.
- **Audit Everything**: Complete audit trail for all crypto operations and message flows.

Follow these principles in all phases to deliver a world-class, secure offline-first POS system.
