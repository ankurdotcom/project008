# Phase 2: POS Terminal Development

## Detailed Prompt for AI Agent
Develop the POS terminal app using React Native. Implement core features: item list with categories, cart management, payment processing, bill printing via Bluetooth, and email sending of sales data. Ensure responsiveness on low-end Android devices and handle offline scenarios. Use the debugging tracker for insights on Android-specific issues like Bluetooth and email integration. Integrate with Google services using free APIs.

## Acceptance Criteria
- App builds and runs on Android emulator/device.
- Item list displays with categories (expandable, alphabetical order, favorites).
- Cart allows add/remove items, quantity input, reverse calculation for amounts.
- Payment screen accepts cash, prints bill via Bluetooth.
- Sales data saved locally and emailed periodically.
- Offline mode: App functions without internet, queues emails.
- UI is responsive and touch-friendly.
- No crashes on low-end devices (test with throttling).

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

## Next Steps
Proceed to Phase 3 after POS app is functional.
