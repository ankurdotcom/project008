# Project Based Learning and Debugging Knowledge Tracker

This tracker is used by AI agents during development to reuse earlier learnings and avoid repeating mistakes. It records insights, solutions, and lessons learned from debugging sessions.

## Learnings and Solutions

### General
- **Offline Handling**: Use IndexedDB or local storage for offline data persistence. Implement service workers for caching in PWAs.
- **Responsive Design**: Use CSS Grid/Flexbox with media queries. Test on low-end devices using browser dev tools throttling.
- **Intermittent Internet**: Implement retry mechanisms with exponential backoff for API calls. Use background sync in PWAs.
- **Google Services Integration**: Use Google APIs (Gmail API, Drive API) with OAuth. Ensure free tier limits are not exceeded (e.g., Gmail API has daily limits).
- **Duplicate Detection**: Use unique transaction IDs or timestamps to identify duplicates. Store processed data hashes.

### POS Terminal (Android)
- **Bluetooth Printing**: Use Android Bluetooth API. Handle permissions and device pairing.
- **Email Sending**: Use Android Intent for email or SMTP library. Ensure Gmail app is configured.
- **Fractional Pricing**: Implement unit conversion logic (e.g., kg to grams).
- **Cart Management**: Use local state or database for cart items. Reset after payment.

### Owner App (PWA)
- **Email Parsing**: Use IMAP or Gmail API to fetch emails. Parse attachments (CSV/JSON).
- **Google Sheets Integration**: Use Google Sheets API for writing data. Handle authentication.
- **Dashboard**: Use charts libraries like Chart.js for reports.
- **Sync Indicator**: Use local storage to track pending syncs. Update UI accordingly.

## Mistakes to Avoid
- **Repeating Mistakes**:
  - Do not forget to handle offline scenarios in UI updates.
  - Always validate data before syncing to avoid corruption.
  - Test on multiple devices/browsers to ensure responsiveness.
  - Use secure authentication for Google APIs to prevent access issues.
  - Implement proper error handling for network failures.

## New Learnings (Add here during development)
- [Date]: [Description of learning or mistake fixed]

