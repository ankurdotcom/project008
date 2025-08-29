# Grocery Shop Chain Sales Tracking System

## Overview
This project implements a sales tracking system for a grocery shop chain. It includes POS terminals on Android devices and an owner dashboard app (PWA). The system uses free Google services for email and data persistence, supports offline operation, and is optimized for low-end devices and slow/intermittent internet.

## Tech Stack
- **POS Terminal**: React Native (Android app)
- **Owner App**: React PWA
- **Backend Integration**: Google Gmail API, Google Drive/Sheets API
- **Offline Support**: Redux Persist, Service Workers
- **Build Tools**: Metro (RN), Webpack (PWA)

## Setup Instructions
### POS Terminal (React Native)
```bash
cd pos
npm install
# For Android development
npm run android
# For iOS development (macOS only)
npm run ios
```

### Owner Dashboard (React PWA)
```bash
cd owner
npm install
npm start
```

## Project Structure
- `business_requirements.md`: Detailed business requirements
- `debugging_tracker.md`: AI learning and debugging tracker
- `pos/`: POS terminal app code
  - React Native with TypeScript
  - Redux Toolkit for state management
  - Redux Persist for offline storage
  - Jest for testing
- `owner/`: Owner dashboard app code
  - React PWA with TypeScript
  - Redux Toolkit for state management
  - Service Workers for offline functionality
  - Jest for testing
- `prompts/`: Development phases with prompts and criteria
  - `phase1_setup.md` to `phase5_testing.md`
  - `tdd_guide.md`
  - `development_principles.md`

## Development Principles
- **Fast, High-Quality, Maintainable**: Follow TDD and modular design.
- **High Performance & UX**: Optimized for low-end devices, offline-first.
- **Zero Bugs**: Comprehensive testing and debugging tracker.
- See `prompts/development_principles.md` for details.

## Setup Instructions
1. Clone the repo.
2. For POS: `cd pos && npm install && npx react-native run-android`
3. For Owner: `cd owner && npm install && npm start`
4. Configure Google APIs and accounts as per requirements.

## Key Features
- Offline/online seamless operation
- Responsive on low-end devices
- Email-based data sync
- Google Sheets reporting
- Bluetooth bill printing
- Cart management with reverse quantity calculation

## Contributing
Use the debugging tracker to log learnings and avoid mistakes. Follow phases sequentially.
