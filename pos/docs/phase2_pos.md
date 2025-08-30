# Phase 2: POS Terminal Development

## Detailed Prompt for AI Agent
Develop the POS terminal app using React Native. Implement core features: item list with categories, cart management, payment processing, bill printing via Bluetooth, and email sending of sales data. Ensure responsiveness on low-end Android devices and handle offline scenarios. Use the debugging tracker for insights on Android-specific issues like Bluetooth and email integration. Integrate with Google services using free APIs. **TDD Step**: Write tests first for each feature (e.g., unit tests for cart logic, integration tests for Bluetooth printing), then implement code to pass them. **Principles**: Prioritize performance (efficient rendering), UX (intuitive touch UI), and zero bugs (comprehensive testing).

## Acceptance Criteria
- App builds and runs on Android emulator/device.
- Item list displays with categories (expandable, alphabetical order, favorites).
- Cart allows add/remove items, quantity input, reverse calculation for amounts.
- Payment screen accepts cash, prints bill via Bluetooth.
- Sales data saved locally and emailed periodically.
- Offline mode: App functions without internet, queues emails.
- UI is responsive and touch-friendly.
- Performance: Fast load times, smooth scrolling on low-end devices.
- UX: Intuitive navigation, clear feedback for actions.
- All tests pass (unit, integration for features).
- No crashes or bugs on low-end devices.

## Edge Cases
- No internet: Queue sales data, show sync indicator.
- Bluetooth failure: Fallback to manual bill entry or error message.
- Invalid email config: Prompt user to configure Gmail.
- Fractional quantities: Handle kg/g, L/ml conversions accurately.
- Duplicate items: Prevent adding same item twice in cart.
- Large item lists: Implement pagination or search.
- Device rotation: UI adapts to portrait/landscape.
- Battery low: Optimize to reduce power consumption.
- Multiple terminals: Unique IDs for each device.

## Demo Requirements
- Demonstrate POS app running on Android device/emulator.
- Show item list with categories, expandable/collapsible functionality.
- Demo adding items to cart, quantity adjustments, and calculations.
- Display offline mode with queued data.
- Present bill printing simulation (if hardware available).
- **Role-Based Access**: Demonstrate Owner vs Sales Person role selection and access differences.

## Role-Based Access Implementation
- **Gmail Authentication**: Users login with Gmail credentials
- **Dynamic User Management**: Owner can add/remove users and assign roles
- **Role-Based UI**: Interface adapts based on user permissions
- **User Management Interface**: Owner-exclusive user administration panel
- **Session Security**: Secure login/logout with role persistence
