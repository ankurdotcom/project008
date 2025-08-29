# Phase 3: Owner App Development

## Detailed Prompt for AI Agent
Develop the Owner app as a PWA using React. Implement dashboard with consolidated reports, email parsing for sales data, Google Sheets integration, and sync features. Ensure it works offline, is installable, and responsive on mobile browsers. Handle duplicate detection and intermittent internet. Reference debugging tracker for PWA and Google API learnings.

## Acceptance Criteria
- PWA installs on mobile browsers and works offline.
- Dashboard displays sales reports from parsed emails.
- Google Sheets integration saves data without duplicates.
- Force sync button and pending sync indicator.
- Responsive design for mobile screens.
- Email parsing handles attachments (CSV/JSON).
- No paid Google services used.

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

## Next Steps
Proceed to Phase 4 after Owner app is functional.
