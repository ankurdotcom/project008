# Phase 3: Owner App Development

## Detailed Prompt for AI Agent
Develop the Owner app as a PWA using React. Implement dashboard with consolidated reports, email parsing for sales data, Google Sheets integration, and sync features. Ensure it works offline, is installable, and responsive on mobile browsers. Handle duplicate detection and intermittent internet. Reference debugging tracker for PWA and Google API learnings. **TDD Step**: Write tests for email parsing, duplicate detection, and UI components before implementation. **Principles**: Ensure maintainable code (modular components), high performance (optimized rendering), and top UX (responsive dashboard).

## Acceptance Criteria
- PWA installs on mobile browsers and works offline.
- Dashboard displays sales reports from parsed emails.
- Google Sheets integration saves data without duplicates.
- Force sync button and pending sync indicator.
- Responsive design for mobile screens.
- Email parsing handles attachments (CSV/JSON).
- Performance: Fast report generation, minimal load times.
- UX: Clear visualizations, easy navigation.
- All tests pass (unit for parsing, E2E for dashboard).
- No paid Google services used.
- Zero bugs in core functionality.

## Edge Cases
- No internet: Show cached data, queue syncs.
- Duplicate emails: Detect via transaction IDs, skip processing.
- Large data sets: Paginate reports, lazy load.
- Google auth failure: Retry with backoff, user notification.
- Slow parsing: Use web workers for heavy tasks.
- Browser compatibility: Test on iOS Safari, Android Chrome.
- Data corruption: Validate before saving to Sheets.
- Multiple owners: Support multiple Google accounts.
- Email spam: Filter only relevant emails.

## Demo Requirements
- Showcase Owner PWA installation and offline functionality.
- Display dashboard with sample sales reports and charts.
- Demo email parsing with mock data attachments.
- Show Google Sheets integration (read/write operations).
- Present force sync and pending sync indicators.
