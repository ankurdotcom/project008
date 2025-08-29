# Development Principles for Grocery Shop Chain Sales Tracking

## Core Principles
This project prioritizes **fast development**, **high quality**, **easy maintenance**, **high performance**, **top-class user experience**, and **zero bugs**. These principles guide every decision in the development process.

## Fast Development
- **TDD Approach**: Write tests first to clarify requirements and catch issues early.
- **Modular Architecture**: Break down features into small, independent modules for quick implementation.
- **Reusable Components**: Build shared UI and logic components to speed up development.
- **Automated Tools**: Use linters, formatters, and CI/CD for rapid feedback.
- **Incremental Phases**: Small, focused phases allow for quick iterations.

## High Quality
- **Code Standards**: Follow ESLint, Prettier, and TypeScript for consistent, error-free code.
- **Peer Reviews**: All code changes reviewed before merge.
- **Documentation**: Comprehensive docs in `prompts/` and inline comments.
- **Version Control**: Git best practices with meaningful commits.

## Easy Maintenance
- **Clean Architecture**: Separation of concerns (UI, business logic, data).
- **Modular Design**: Easy to update individual features without affecting others.
- **Dependency Management**: Minimal, well-maintained dependencies.
- **Knowledge Sharing**: Debugging tracker and phase docs for team continuity.

## High Performance
- **Optimized for Low-End Devices**: Minimal bundle sizes, efficient rendering.
- **Lazy Loading**: Load components/data on demand.
- **Caching**: Service workers for offline, Redux for state.
- **Efficient Algorithms**: Fast search, sorting, and calculations.
- **Monitoring**: Performance metrics and profiling.

## Top-Class User Experience
- **Responsive Design**: Works seamlessly on all devices/browsers.
- **Offline-First**: Full functionality without internet.
- **Intuitive UI**: Simple, touch-friendly interfaces.
- **Accessibility**: WCAG compliant for all users.
- **Feedback Loops**: Loading indicators, error messages, sync status.

## Zero Bugs
- **Comprehensive Testing**: 80%+ coverage with unit, integration, E2E tests.
- **Edge Case Handling**: Test all scenarios (no internet, device failures).
- **Debugging Tracker**: Learn from past mistakes, prevent regressions.
- **Automated Testing**: Run tests on every commit.
- **Bug Tracking**: Use issues for tracking and resolution.

## Implementation Guidelines
- **Tech Stack Choice**: Lightweight frameworks (React Native, React PWA) for performance.
- **Best Practices**: SOLID principles, DRY, KISS.
- **Performance Budgets**: Set limits for bundle size, load times.
- **User Testing**: Regular UX testing on target devices.
- **Continuous Improvement**: Retrospectives after each phase.

## Metrics for Success
- **Development Speed**: Time to complete phases within estimates.
- **Quality**: Test pass rate, code coverage, linting compliance.
- **Performance**: Lighthouse scores >90, load times <2s.
- **UX**: User satisfaction surveys, error rates <1%.
- **Bugs**: Zero critical bugs in production.

Follow these principles in all phases to deliver a world-class product.
