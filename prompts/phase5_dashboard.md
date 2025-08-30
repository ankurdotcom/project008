# Phase 5: Dashboard & Status Tracking

## Detailed Prompt for AI Agent
Build comprehensive dashboards for Owner and POS terminals with real-time status tracking, sales analytics, and terminal health monitoring. Implement config update broadcasting and rollback capabilities. Create audit trails and reporting features. **TDD Step**: Write UI component tests and data visualization tests before implementing dashboard features. **Principles**: Focus on clear data presentation, real-time updates, and actionable insights for business decisions.

## Acceptance Criteria
- Owner dashboard: Sales analytics, terminal status, message delivery tracking
- POS dashboard: Local sales summary, sync status, queue health
- Real-time updates: Live data refresh without page reload
- Config broadcasting: Owner can push updates to all/specific POS terminals
- Status tracking: Monitor terminal connectivity, message delivery, error rates
- Audit trail: Complete log of all system activities and message flows
- Data visualization: Charts and graphs for sales trends and performance
- Config rollback: Version history with rollback capabilities
- Performance: Dashboard loads in <2s with smooth interactions

## Edge Cases
- Large datasets: Efficient pagination and lazy loading
- Real-time updates: Handle high-frequency data changes
- Offline viewing: Cached dashboard data when offline
- Multiple users: Concurrent dashboard access and data consistency
- Data export: Generate reports in multiple formats
- Time zone handling: Consistent timestamp display across devices
- Accessibility: WCAG compliant dashboard interface
- Mobile optimization: Responsive design for small screens

## Demo Requirements
- Showcase Owner dashboard with sales analytics
- Demonstrate real-time status updates
- Display terminal health monitoring
- Show config update broadcasting
- Present audit trail and reporting features
- Demonstrate data visualization and charts

## Technical Implementation
- **Dashboard Components**:
  ```javascript
  // Owner Dashboard
  <SalesOverview />
  <TerminalGrid />
  <MessageQueue />
  <ConfigManager />

  // POS Dashboard
  <LocalSales />
  <SyncStatus />
  <QueueHealth />
  ```
- **Data Visualization**:
  - Chart.js or D3.js for sales trends
  - Real-time charts for terminal status
  - Interactive filters and date ranges
- **Status Tracking**:
  ```javascript
  const terminalStatus = {
    deviceId: 'string',
    lastSeen: 'ISO8601',
    messageCount: number,
    errorRate: number,
    syncStatus: 'ONLINE' | 'OFFLINE' | 'SYNCING',
    configVersion: number
  };
  ```
- **Audit System**: Append-only log with searchable interface
- **Config Management**: Version control for configuration updates
- **Export Features**: CSV/PDF report generation
