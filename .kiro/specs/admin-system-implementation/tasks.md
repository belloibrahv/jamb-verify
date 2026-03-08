# Implementation Plan: Admin System Implementation

## Overview

This implementation plan breaks down the comprehensive admin system for VerifyNIN into 6 phases following the migration plan from the design document. The system includes admin authentication, user management, support tickets, payment reconciliation, analytics dashboard, transaction management, system health monitoring, and audit logging.

The implementation uses Next.js 15 App Router with TypeScript, PostgreSQL with Drizzle ORM, shadcn/ui components, Recharts for visualizations, and TanStack Table for data tables. The database schema already exists in migration 0002_add_admin_system.sql and needs to be applied first.

## Tasks

- [ ] 1. Phase 1: Foundation and Database Setup
  - [x] 1.1 Run database migration and create initial super admin
    - Execute db/migrations/0002_add_admin_system.sql to create admin tables
    - Create script scripts/create-super-admin.ts to initialize first super admin user
    - Add environment variables for admin system (FIRST_SUPER_ADMIN_EMAIL, EMAIL_API_KEY, EMAIL_FROM)
    - Test database schema by querying new tables
    - _Requirements: 1.1, 15.1_

  - [x] 1.2 Update middleware for admin route protection
    - Modify middleware.ts to check user role for /admin routes
    - Redirect non-admin users to dashboard with 401 status
    - Include role field in session data for admin users
    - Add rate limiting for admin endpoints (100 req/min)
    - _Requirements: 1.1, 1.2, 1.3, 20.1, 20.3_

  - [ ]* 1.3 Write property test for admin access control
    - **Property 1: Admin Access Control**
    - **Validates: Requirements 1.1, 1.2**

  - [ ] 1.4 Create admin layout with sidebar navigation
    - Create app/admin/layout.tsx with sidebar and header
    - Create components/admin/layout/admin-sidebar.tsx with navigation links
    - Create components/admin/layout/admin-header.tsx with user info and logout
    - Implement responsive design (collapse to hamburger on mobile)
    - Add breadcrumb navigation component
    - _Requirements: 16.1, 16.3, 16.4, 16.5, 16.7, 16.9_

  - [ ]* 1.5 Write unit tests for middleware protection
    - Test admin role access allowed
    - Test user role access denied
    - Test session validation
    - _Requirements: 1.1, 1.2_


- [ ] 2. Phase 2: User Management System
  - [ ] 2.1 Create user list page with data table
    - Create app/admin/users/page.tsx with server component data fetching
    - Create components/admin/users/user-table.tsx using TanStack Table
    - Implement pagination (50 users per page)
    - Display user columns: name, email, phone, role, status, balance, registration date
    - Add action menu for each user row (view details, suspend, activate)
    - _Requirements: 2.1, 2.8, 2.5_

  - [ ] 2.2 Implement user search and filters
    - Create components/admin/users/user-filters.tsx with search input and filter dropdowns
    - Add search by email, full name, and phone number
    - Add filters for role, suspension status, and date range
    - Add sorting by registration date, balance, and last activity
    - Debounce search input (300ms)
    - _Requirements: 2.2, 2.3, 2.4, 18.1, 18.6_

  - [ ]* 2.3 Write property tests for user list
    - **Property 3: User List Pagination Size**
    - **Validates: Requirements 2.8**
    - **Property 4: User Search Completeness**
    - **Validates: Requirements 2.2**

  - [ ] 2.4 Create user detail modal with transaction and verification history
    - Create components/admin/users/user-detail-modal.tsx
    - Display user profile information (name, email, phone, role, status, balance)
    - Display paginated transaction history
    - Display paginated verification history
    - Display support tickets list
    - Display activity summary
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ] 2.5 Implement user suspension functionality
    - Create components/admin/users/suspend-user-dialog.tsx with reason input
    - Create server action to suspend user (set is_suspended, suspended_at, suspended_reason)
    - Validate suspension reason (minimum 10 characters)
    - Log action in admin_actions table
    - Update UI to reflect suspension status
    - _Requirements: 3.1, 3.2, 3.7_

  - [ ]* 2.6 Write property tests for user suspension
    - **Property 5: User Suspension State**
    - **Validates: Requirements 3.1, 3.7**
    - **Property 6: Suspension Audit Logging**
    - **Validates: Requirements 3.2, 13.1**
    - **Property 7: Suspended User Login Denial**
    - **Validates: Requirements 3.3**

  - [ ] 2.7 Implement user activation functionality
    - Create server action to activate user (clear suspension fields)
    - Log action in admin_actions table
    - Update UI to reflect active status
    - _Requirements: 3.5, 3.6_

  - [ ] 2.8 Create API endpoint for user list
    - Create app/api/admin/users/route.ts with GET handler
    - Implement query parameters: page, search, role, suspended, sortBy, sortOrder
    - Return paginated user list with pagination metadata
    - Apply rate limiting (100 req/min)
    - Cache results for 60 seconds
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 18.9, 20.1_

  - [ ] 2.9 Create API endpoint for user detail
    - Create app/api/admin/users/[id]/route.ts with GET handler
    - Return user details with transaction and verification history
    - Apply rate limiting
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ]* 2.10 Write unit tests for user management
    - Test user list pagination
    - Test search functionality
    - Test suspension with valid reason
    - Test suspension with invalid reason (should fail)
    - Test activation
    - _Requirements: 2.1, 2.2, 3.1, 3.5_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 4. Phase 3: Support Ticket System
  - [ ] 4.1 Create ticket submission form (user side)
    - Create app/tickets/new/page.tsx with ticket creation form
    - Add ticket type selection dropdown (payment_issue, verification_issue, account_issue, technical_issue, general)
    - Add subject input (5-200 characters validation)
    - Add description textarea (20-2000 characters validation)
    - Conditionally show payment reference input for payment_issue type
    - Conditionally show verification selection for verification_issue type
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 4.2 Create API endpoint for ticket creation
    - Create app/api/tickets/route.ts with POST handler
    - Validate ticket data (subject length, description length, required fields)
    - Generate unique ticket ID with format T-XXXXXXXX
    - Create support_tickets record with status 'open' and priority 'medium'
    - Send email confirmation to user
    - Apply rate limiting (10 req/hour per user)
    - _Requirements: 4.7, 4.8, 4.9, 17.1_

  - [ ]* 4.3 Write property tests for ticket creation
    - **Property 8: Ticket Subject Validation**
    - **Validates: Requirements 4.3**
    - **Property 9: Ticket Description Validation**
    - **Validates: Requirements 4.4**
    - **Property 10: Ticket ID Format**
    - **Validates: Requirements 4.8**

  - [ ] 4.4 Create user ticket list page
    - Create app/tickets/page.tsx to display user's tickets
    - Show ticket ID, subject, status, priority, creation date
    - Link to ticket detail page
    - _Requirements: 4.10_

  - [ ] 4.5 Create admin ticket list page
    - Create app/admin/tickets/page.tsx with ticket cards
    - Display all tickets sorted by created_at descending
    - Show priority indicator, ticket ID, subject, user email, creation time, type
    - Highlight urgent priority tickets with red color
    - Implement pagination (20 tickets per page)
    - _Requirements: 5.1, 5.6, 5.9, 5.10_

  - [ ] 4.6 Implement ticket filters and search
    - Create components/admin/tickets/ticket-filters.tsx
    - Add filters for status (open, in_progress, resolved, closed)
    - Add filters for priority (low, medium, high, urgent)
    - Add filters for ticket type
    - Add search by ticket ID, user email, and subject
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.7 Write property tests for ticket list
    - **Property 11: Ticket List Sort Order**
    - **Validates: Requirements 5.1**
    - **Property 12: Ticket Pagination Size**
    - **Validates: Requirements 5.10**

  - [ ] 4.8 Create API endpoint for admin ticket list
    - Create app/api/admin/tickets/route.ts with GET handler
    - Implement query parameters: status, priority, type, search, page
    - Return paginated ticket list
    - Apply rate limiting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 20.1_

  - [ ] 4.9 Create ticket detail page with conversation thread
    - Create app/admin/tickets/[id]/page.tsx
    - Create components/admin/tickets/conversation-thread.tsx to display messages chronologically
    - Display message sender (user or admin name) and timestamp
    - Show user information sidebar with profile and wallet balance
    - Display payment details card for payment_issue tickets
    - Display verification details card for verification_issue tickets
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8_

  - [ ]* 4.10 Write property tests for ticket messages
    - **Property 13: Ticket Message Chronological Order**
    - **Validates: Requirements 6.1**
    - **Property 14: Admin Message Flag**
    - **Validates: Requirements 6.6**

  - [ ] 4.11 Implement ticket messaging functionality
    - Create components/admin/tickets/message-input.tsx for admin responses
    - Create server action to add ticket message
    - Set is_admin flag based on sender role
    - Update ticket updated_at timestamp
    - Send email notification to user (if not internal)
    - Support internal notes (is_internal = true, visible only to admins)
    - _Requirements: 6.5, 6.6, 6.7, 6.9, 6.10, 17.2_

  - [ ]* 4.12 Write property test for ticket updates
    - **Property 15: Ticket Updated Timestamp**
    - **Validates: Requirements 6.10**

  - [ ] 4.13 Create API endpoint for ticket messages
    - Create app/api/admin/tickets/[id]/messages/route.ts with POST handler
    - Validate message content
    - Create ticket_messages record
    - Send email notification
    - Apply rate limiting
    - _Requirements: 6.5, 6.6, 6.7, 17.2_

  - [ ]* 4.14 Write unit tests for ticket messaging
    - Test message creation
    - Test admin message flag
    - Test email notification
    - Test internal notes visibility
    - _Requirements: 6.5, 6.6, 6.7, 6.9_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 6. Phase 3 (continued): Ticket Status and Payment Reconciliation
  - [ ] 6.1 Implement ticket status management
    - Create status dropdown component with options: open, in_progress, resolved, closed
    - Create server action to update ticket status
    - Set resolved_at timestamp when status changes to 'resolved'
    - Prevent status changes for closed tickets
    - Log all status changes in admin_actions table
    - Send email notification to user on status change
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.9, 7.10, 17.3_

  - [ ]* 6.2 Write property tests for ticket status
    - **Property 16: Resolved Ticket Timestamp**
    - **Validates: Requirements 7.3**
    - **Property 17: Closed Ticket Immutability**
    - **Validates: Requirements 7.4**

  - [ ] 6.3 Implement ticket assignment functionality
    - Create assignment dropdown listing all admin users
    - Create server action to assign ticket
    - Add "Assign to Me" quick button
    - Log assignment in admin_actions table
    - Send email notification to assigned admin
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 17.5_

  - [ ] 6.4 Create API endpoints for ticket status and assignment
    - Create app/api/admin/tickets/[id]/status/route.ts with PATCH handler
    - Create app/api/admin/tickets/[id]/assign/route.ts with POST handler
    - Apply rate limiting
    - _Requirements: 7.1, 7.5, 20.1_

  - [ ] 6.5 Implement payment reconciliation from tickets
    - Create components/admin/tickets/reconcile-payment-button.tsx
    - Show button only for payment_issue tickets with payment_reference
    - Create server action to call existing /api/admin/reconcile-payment endpoint
    - On success, change ticket status to 'resolved'
    - Add automated message to ticket indicating successful reconciliation
    - Log reconciliation in admin_actions table
    - Send email notification to user
    - Display error message on failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 6.6 Write property test for payment reconciliation workflow
    - **Property 18: Payment Reconciliation Workflow**
    - **Validates: Requirements 8.3, 8.4**

  - [ ] 6.7 Create API endpoint for payment reconciliation
    - Create app/api/admin/tickets/[id]/reconcile/route.ts with POST handler
    - Call existing reconcile-payment endpoint
    - Update ticket status
    - Add automated message
    - Apply rate limiting
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 20.1_

  - [ ]* 6.8 Write unit tests for ticket status and reconciliation
    - Test status change to resolved
    - Test closed ticket immutability
    - Test ticket assignment
    - Test payment reconciliation success
    - Test payment reconciliation failure
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 8.2, 8.5_

  - [ ] 6.9 Add notification badge to tickets navigation
    - Update admin sidebar to show count of open tickets
    - Query support_tickets where status IN ('open', 'in_progress')
    - Display badge with count
    - _Requirements: 16.6_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 8. Phase 4: Analytics Dashboard
  - [ ] 8.1 Create analytics service with metric calculations
    - Create lib/admin/analytics.ts with functions for calculating metrics
    - Implement getTotalUsers() query
    - Implement getActiveUsers(days: number) query (users with activity in last N days)
    - Implement getMonthlyRevenue() query (sum of completed transactions for current month)
    - Implement getPendingTickets() query (count of open/in_progress tickets)
    - Implement getVerificationSuccessRate() query (percentage of successful verifications)
    - Implement getAverageTransactionValue() query
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 8.2 Implement percentage change calculations
    - Add calculatePercentageChange(current, previous) utility function
    - Handle zero and null previous values
    - Return formatted string (e.g., "+12%", "-5%")
    - _Requirements: 9.11_

  - [ ]* 8.3 Write property test for percentage change
    - **Property 19: Percentage Change Calculation**
    - **Validates: Requirements 9.11**

  - [ ] 8.4 Create dashboard page with metric cards
    - Create app/admin/page.tsx (main dashboard)
    - Create components/admin/dashboard/metric-card.tsx
    - Display total users, active users, monthly revenue, pending tickets, success rate, avg transaction value
    - Calculate and display percentage change for each metric
    - Use color coding (blue, green, amber, red) for different metric types
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.11_

  - [ ] 8.5 Create user growth chart
    - Create components/admin/dashboard/user-growth-chart.tsx using Recharts
    - Query daily registration counts for last 30 days
    - Display as line chart
    - _Requirements: 9.7_

  - [ ] 8.6 Create revenue chart
    - Create components/admin/dashboard/revenue-chart.tsx using Recharts
    - Query daily revenue for last 30 days
    - Display as bar chart
    - Format currency values (kobo to naira)
    - _Requirements: 9.8_

  - [ ] 8.7 Create verification success/failure pie chart
    - Create components/admin/dashboard/verification-pie-chart.tsx using Recharts
    - Query verification counts by status for current month
    - Display as pie chart with success/failure segments
    - _Requirements: 9.9_

  - [ ] 8.8 Create activity feed component
    - Create components/admin/dashboard/activity-feed.tsx
    - Query last 10 events from audit_logs (registrations, verifications, payments, tickets)
    - Display chronologically with icons and timestamps
    - _Requirements: 9.10_

  - [ ] 8.9 Implement dashboard auto-refresh
    - Add client-side polling to refresh metrics every 60 seconds
    - Use React Query or similar for data fetching
    - Show loading state during refresh
    - _Requirements: 9.12_

  - [ ] 8.10 Create API endpoint for dashboard metrics
    - Create app/api/admin/analytics/overview/route.ts with GET handler
    - Return all dashboard metrics in single response
    - Cache results for 60 seconds
    - Apply rate limiting
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 18.9, 20.1_

  - [ ]* 8.11 Write unit tests for analytics calculations
    - Test total users count
    - Test active users calculation
    - Test monthly revenue sum
    - Test percentage change with various inputs
    - Test percentage change with zero previous value
    - _Requirements: 9.1, 9.2, 9.3, 9.11_

- [ ] 9. Phase 4 (continued): Advanced Analytics
  - [ ] 9.1 Create advanced analytics page
    - Create app/admin/analytics/page.tsx
    - Create components/admin/analytics/date-range-picker.tsx with presets
    - Add presets: Last 7 Days, Last 30 Days, Last 90 Days, Custom Range
    - _Requirements: 10.1_

  - [ ] 9.2 Implement revenue trend chart with granularity
    - Create components/admin/analytics/revenue-trend-chart.tsx
    - Support daily, weekly, monthly granularity based on date range
    - Query revenue data for selected date range
    - Display as line chart
    - _Requirements: 10.2, 10.3_

  - [ ] 9.3 Implement user growth trend chart
    - Create components/admin/analytics/user-growth-trend-chart.tsx
    - Query registration counts for selected date range
    - Display as line chart
    - _Requirements: 10.4_

  - [ ] 9.4 Implement verification success rate trend
    - Create components/admin/analytics/verification-trend-chart.tsx
    - Query verification success rate over time for selected date range
    - Display as line chart
    - _Requirements: 10.5_

  - [ ] 9.5 Calculate advanced metrics
    - Add calculateARPU() function (average revenue per user)
    - Add calculateDAU() function (daily active users average)
    - Add calculateConversionRate() function (registrations to first verification)
    - Display metrics in cards
    - _Requirements: 10.6, 10.7, 10.8_

  - [ ] 9.6 Implement CSV export for analytics
    - Create export button for metrics tables
    - Generate CSV with date, metric name, and value columns
    - Apply 10,000 row limit
    - Generate within 5 seconds for date ranges up to 1 year
    - _Requirements: 10.9, 10.10_

  - [ ] 9.7 Create API endpoints for analytics data
    - Create app/api/admin/analytics/revenue/route.ts with GET handler
    - Create app/api/admin/analytics/users/route.ts with GET handler
    - Support dateFrom, dateTo, granularity query parameters
    - Apply rate limiting
    - _Requirements: 10.1, 10.2, 20.1_

  - [ ]* 9.8 Write unit tests for advanced analytics
    - Test ARPU calculation
    - Test DAU calculation
    - Test conversion rate calculation
    - Test date range filtering
    - _Requirements: 10.6, 10.7, 10.8_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Phase 5: Transaction and Verification Management
  - [ ] 11.1 Create transaction list page
    - Create app/admin/transactions/page.tsx
    - Create components/admin/transactions/transaction-table.tsx using TanStack Table
    - Display columns: date/time, user email, type, amount, status, reference
    - Implement pagination (50 transactions per page)
    - Add action menu for viewing details
    - _Requirements: 11.1, 11.6, 11.10_

  - [ ] 11.2 Implement transaction filters and search
    - Create components/admin/transactions/transaction-filters.tsx
    - Add filters for transaction type (credit, debit, refund)
    - Add filters for transaction status (pending, completed, failed, refunded)
    - Add date range filter
    - Add search by payment reference, user email, and NIN (masked)
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [ ] 11.3 Create transaction summary component
    - Create components/admin/transactions/transaction-summary.tsx
    - Calculate total count, total volume, and success rate
    - Display summary cards above transaction table
    - _Requirements: 11.9_

  - [ ]* 11.4 Write property test for transaction summary
    - **Property 20: Transaction Summary Accuracy**
    - **Validates: Requirements 11.9**

  - [ ] 11.5 Create transaction detail modal
    - Create components/admin/transactions/transaction-detail-modal.tsx
    - Display full transaction details including provider data and metadata
    - Show user information
    - Display related verification if applicable
    - _Requirements: 11.7_

  - [ ] 11.6 Implement CSV export for transactions
    - Add export button to transaction page
    - Generate CSV with transaction data
    - Apply 10,000 row limit
    - Format dates as ISO 8601, amounts as numbers
    - Include column headers
    - _Requirements: 11.8, 19.1, 19.2, 19.5, 19.6, 19.7, 19.8_

  - [ ] 11.7 Create API endpoint for transaction list
    - Create app/api/admin/transactions/route.ts with GET handler
    - Implement query parameters: type, status, dateFrom, dateTo, search, page
    - Return paginated transaction list with summary
    - Apply rate limiting
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 20.1_

  - [ ] 11.8 Create API endpoint for transaction detail
    - Create app/api/admin/transactions/[id]/route.ts with GET handler
    - Return full transaction details
    - Apply rate limiting
    - _Requirements: 11.7, 20.1_

  - [ ] 11.9 Create API endpoint for transaction export
    - Create app/api/admin/transactions/export/route.ts with POST handler
    - Generate CSV file from filtered transactions
    - Apply 10 req/hour rate limit
    - Return CSV file with proper headers
    - _Requirements: 11.8, 19.1, 19.2, 20.1_

  - [ ]* 11.10 Write unit tests for transaction management
    - Test transaction list pagination
    - Test transaction filters
    - Test transaction summary calculations
    - Test CSV export generation
    - Test CSV row limit enforcement
    - _Requirements: 11.1, 11.2, 11.9, 19.8_

- [ ] 12. Phase 5 (continued): Verification Management
  - [ ] 12.1 Create verification list page
    - Create app/admin/verifications/page.tsx (or section in transactions page)
    - Create components/admin/verifications/verification-table.tsx using TanStack Table
    - Display columns: date/time, user email, NIN (masked), status, purpose, provider reference
    - Implement pagination (50 verifications per page)
    - _Requirements: 12.1, 12.6, 12.10_

  - [ ] 12.2 Implement verification filters and search
    - Create components/admin/verifications/verification-filters.tsx
    - Add filters for verification status (pending, success, failed)
    - Add filters for verification purpose
    - Add date range filter
    - Add search by user email and NIN (masked)
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

  - [ ] 12.3 Create verification summary component
    - Create components/admin/verifications/verification-summary.tsx
    - Calculate total count, success count, failure count, and success rate
    - Display summary cards
    - _Requirements: 12.8_

  - [ ] 12.4 Create verification detail modal
    - Create components/admin/verifications/verification-detail-modal.tsx
    - Display full verification details including error message and raw response
    - Mask NIN (show only last 4 digits)
    - Show user information
    - _Requirements: 12.7, 20.10_

  - [ ] 12.5 Implement CSV export for verifications
    - Add export button to verifications page
    - Generate CSV with verification data
    - Mask NIN in export (show only last 4 digits)
    - Apply 10,000 row limit
    - _Requirements: 12.9, 19.3, 19.8, 20.10_

  - [ ]* 12.6 Write unit tests for verification management
    - Test verification list pagination
    - Test verification filters
    - Test verification summary calculations
    - Test NIN masking in display and export
    - _Requirements: 12.1, 12.2, 12.8, 20.10_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 14. Phase 5 (continued): System Health Monitoring
  - [ ] 14.1 Create system health service
    - Create lib/admin/system-health.ts with health check functions
    - Implement getAPIStatus() based on recent error rate
    - Implement getDatabaseStatus() checking connection health
    - Implement getPaystackStatus() based on transaction success rate
    - Implement getYouVerifyStatus() based on verification success rate
    - Implement getWebhookStatus() calculating delivery rate
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 14.2 Create system health page
    - Create app/admin/system/page.tsx
    - Create components/admin/system/health-status-card.tsx for each service
    - Display status indicators (healthy, degraded, down) with color coding
    - Show warning indicators for degraded services
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.8, 14.9_

  - [ ] 14.3 Create API response time chart
    - Create components/admin/system/response-time-chart.tsx using Recharts
    - Query average response times for last hour with 5-minute intervals
    - Display as line chart
    - Show warning indicator if average exceeds 1000ms
    - _Requirements: 14.6, 14.9_

  - [ ] 14.4 Create error log component
    - Create components/admin/system/error-log.tsx
    - Display last 50 errors with timestamp, error type, and message
    - Support expanding to view full stack trace
    - _Requirements: 14.7_

  - [ ] 14.5 Implement system health auto-refresh
    - Add client-side polling to refresh health metrics every 30 seconds
    - Show loading state during refresh
    - _Requirements: 14.10_

  - [ ] 14.6 Create API endpoint for system health
    - Create app/api/admin/system/health/route.ts with GET handler
    - Return all health metrics in single response
    - Cache results for 30 seconds
    - Apply rate limiting
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 20.1_

  - [ ] 14.7 Create API endpoint for error logs
    - Create app/api/admin/system/errors/route.ts with GET handler
    - Return recent errors with pagination
    - Apply rate limiting
    - _Requirements: 14.7, 20.1_

  - [ ]* 14.8 Write unit tests for system health
    - Test API status calculation
    - Test database status check
    - Test webhook delivery rate calculation
    - Test warning indicators
    - _Requirements: 14.1, 14.2, 14.5, 14.8_

- [ ] 15. Phase 5 (continued): Admin Actions Log and Role Management
  - [ ] 15.1 Create admin actions log page (super_admin only)
    - Create app/admin/actions/page.tsx
    - Create components/admin/actions/actions-table.tsx using TanStack Table
    - Display columns: timestamp, admin name, action type, target user, description
    - Implement pagination
    - Restrict access to super_admin role only
    - _Requirements: 13.9, 15.1_

  - [ ] 15.2 Implement admin actions filters
    - Create components/admin/actions/actions-filters.tsx
    - Add filter by admin user
    - Add filter by action type
    - Add date range filter
    - _Requirements: 13.9_

  - [ ] 15.3 Create admin action detail modal
    - Create components/admin/actions/action-detail-modal.tsx
    - Display full action details including metadata (old/new values)
    - Show IP address and user agent
    - _Requirements: 13.7, 13.8_

  - [ ]* 15.4 Write property test for admin action metadata
    - **Property 21: Admin Action Metadata Structure**
    - **Validates: Requirements 13.8**

  - [ ] 15.5 Implement CSV export for admin actions
    - Add export button to admin actions page
    - Generate CSV with action data
    - Apply 10,000 row limit
    - _Requirements: 13.10, 19.4_

  - [ ] 15.6 Create API endpoint for admin actions log
    - Create app/api/admin/actions/route.ts with GET handler
    - Implement query parameters: adminId, actionType, dateFrom, dateTo, page
    - Restrict to super_admin role
    - Apply rate limiting
    - _Requirements: 13.9, 15.1, 20.1_

  - [ ] 15.7 Implement role management functionality (super_admin only)
    - Add role change dropdown to user detail modal (visible only to super_admin)
    - Create server action to change user role
    - Validate that super_admin cannot change their own role
    - Log role change in admin_actions table with old and new role
    - Send email notification to user
    - Revoke admin access immediately if role changed from admin to user
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ]* 15.8 Write property tests for role management
    - **Property 22: Role Change Updates Database**
    - **Validates: Requirements 15.3**
    - **Property 23: Self-Role-Change Prevention**
    - **Validates: Requirements 15.6**

  - [ ] 15.9 Create API endpoint for role changes
    - Create app/api/admin/users/[id]/role/route.ts with PATCH handler
    - Restrict to super_admin role
    - Validate role change request
    - Apply rate limiting
    - _Requirements: 15.1, 15.2, 15.3, 20.1_

  - [ ]* 15.10 Write unit tests for role management
    - Test role change by super_admin
    - Test role change denied for non-super_admin
    - Test self-role-change prevention
    - Test email notification
    - _Requirements: 15.1, 15.2, 15.6, 15.7_

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 17. Phase 6: Email Notifications and Shared Components
  - [ ] 17.1 Create email service
    - Create lib/email.ts with email sending functions
    - Integrate with Resend or similar email service
    - Add sendTicketCreatedEmail(user, ticket) function
    - Add sendTicketResponseEmail(user, ticket, message) function
    - Add sendTicketStatusChangedEmail(user, ticket, newStatus) function
    - Add sendPaymentReconciledEmail(user, amount, reference) function
    - Add sendTicketAssignedEmail(admin, ticket) function
    - Add sendRoleChangedEmail(user, oldRole, newRole) function
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.7_

  - [ ] 17.2 Create email templates
    - Create email templates with platform branding
    - Include ticket ID, subject, and direct link in all ticket emails
    - Use consistent styling across all templates
    - Set sender as noreply@verifynin.ng
    - _Requirements: 17.6, 17.7, 17.8_

  - [ ] 17.3 Implement email error handling and logging
    - Log email delivery failures in audit_logs
    - Implement retry logic for failed emails
    - _Requirements: 17.9_

  - [ ] 17.4 Implement email deduplication
    - Track sent emails with timestamp and recipient
    - Prevent duplicate notifications for same event within 5 minutes
    - _Requirements: 17.10_

  - [ ]* 17.5 Write property test for email deduplication
    - **Property 24: Email Notification Deduplication**
    - **Validates: Requirements 17.10**

  - [ ]* 17.6 Write unit tests for email service
    - Test email sending success
    - Test email sending failure and logging
    - Test email deduplication
    - Test email template rendering
    - _Requirements: 17.1, 17.2, 17.9, 17.10_

  - [ ] 17.7 Create shared UI components
    - Create components/admin/shared/status-badge.tsx with color coding
    - Create components/admin/shared/priority-badge.tsx with color coding
    - Create components/admin/shared/action-menu.tsx for row actions
    - Create components/admin/shared/data-table.tsx reusable table component
    - _Requirements: 2.1, 5.6, 11.1_

  - [ ] 17.8 Implement quick search in admin header
    - Add search bar to admin header
    - Support searching users by email
    - Support searching tickets by ID
    - Support searching transactions by reference
    - Display search results in dropdown
    - _Requirements: 16.10_

  - [ ] 17.9 Add environment variables and configuration
    - Add EMAIL_API_KEY to .env
    - Add EMAIL_FROM to .env
    - Add ADMIN_SECRET_KEY to .env
    - Add FIRST_SUPER_ADMIN_EMAIL to .env
    - Update .env.example with new variables
    - _Requirements: 1.1, 17.8_

  - [ ]* 17.10 Write unit tests for shared components
    - Test status badge rendering
    - Test priority badge rendering
    - Test action menu functionality
    - Test data table sorting and pagination
    - _Requirements: 2.1, 5.6_

- [ ] 18. Phase 6 (continued): Performance Optimization and Security
  - [ ] 18.1 Implement search and filter performance optimizations
    - Add database indexes on frequently queried fields (if not already present)
    - Implement query result caching (60 seconds for counts)
    - Add loading indicators for search operations
    - Display timeout warning for operations > 1 second
    - Display message for search results > 1000 suggesting more specific criteria
    - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.7, 18.8, 18.9_

  - [ ]* 18.2 Write property tests for filter logic
    - **Property 25: Filter Combination Logic**
    - **Validates: Requirements 18.3**
    - **Property 26: Data Caching Consistency**
    - **Validates: Requirements 18.9**

  - [ ] 18.3 Implement CSV export utilities
    - Create lib/admin/export.ts with CSV generation functions
    - Implement generateCSV(data, columns) function
    - Format dates as ISO 8601
    - Format currency as numbers without symbols
    - Include column headers in first row
    - Enforce 10,000 row limit
    - Generate filename with format: {resource}_{date}_{time}.csv
    - _Requirements: 19.5, 19.6, 19.7, 19.8, 19.10_

  - [ ]* 18.4 Write property tests for CSV export
    - **Property 27: CSV Export Headers**
    - **Validates: Requirements 19.5**
    - **Property 28: CSV Export Row Limit**
    - **Validates: Requirements 19.8**

  - [ ] 18.5 Implement rate limiting for admin endpoints
    - Update lib/rate-limit.ts to support admin-specific limits
    - Apply 100 req/min limit to all admin API endpoints
    - Apply 10 req/hour limit to CSV export endpoints
    - Return HTTP 429 with Retry-After header when exceeded
    - Log rate limit violations
    - _Requirements: 20.1, 20.2_

  - [ ]* 18.6 Write property test for rate limiting
    - **Property 29: Rate Limit Enforcement**
    - **Validates: Requirements 20.1, 20.2**

  - [ ] 18.7 Implement security measures
    - Add CSRF token validation for all state-changing operations
    - Sanitize all user input to prevent XSS
    - Mask sensitive data (NIN, password hashes) in all interfaces
    - Log all failed authentication attempts with IP address
    - Implement IP blocking after 5 failed attempts in 10 minutes (30 min block)
    - Ensure HTTPS enforcement in production
    - _Requirements: 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10_

  - [ ]* 18.8 Write property test for sensitive data masking
    - **Property 30: Sensitive Data Masking**
    - **Validates: Requirements 20.10**

  - [ ]* 18.9 Write unit tests for security measures
    - Test CSRF token validation
    - Test input sanitization
    - Test NIN masking
    - Test failed login attempt logging
    - Test IP blocking after multiple failures
    - _Requirements: 20.3, 20.5, 20.6, 20.8, 20.9, 20.10_

- [ ] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 20. Phase 6 (continued): Integration and Final Testing
  - [ ] 20.1 Install required dependencies
    - Install recharts for charts
    - Install @tanstack/react-table for data tables
    - Install @tanstack/react-query for server state management
    - Install date-fns for date formatting
    - Install react-hot-toast for notifications
    - Install xlsx for CSV export (if needed)
    - Install fast-check for property-based testing
    - Run npm install and verify no conflicts
    - _Requirements: All_

  - [ ] 20.2 Wire all components together
    - Ensure all pages are properly linked in navigation
    - Verify all API endpoints are connected to UI components
    - Test all server actions are properly called
    - Verify all email notifications are triggered correctly
    - Test all audit logging is working
    - _Requirements: All_

  - [ ] 20.3 Create comprehensive integration tests
    - Test complete user suspension workflow (suspend → login denied → activate → login allowed)
    - Test complete ticket workflow (create → admin responds → status change → resolve)
    - Test complete payment reconciliation workflow (ticket → reconcile → wallet updated → ticket resolved)
    - Test role change workflow (super_admin changes role → access updated → email sent)
    - Test analytics dashboard data flow (database → calculations → charts)
    - _Requirements: 3.1, 3.3, 3.5, 4.7, 6.5, 7.1, 8.2, 15.3_

  - [ ] 20.4 Run all property-based tests
    - Execute all 30 property tests with minimum 100 iterations each
    - Verify all properties pass
    - Document any failures and fix underlying issues
    - _Requirements: All correctness properties_

  - [ ] 20.5 Perform manual testing of critical workflows
    - Test admin login and access control
    - Test user search and filtering
    - Test ticket creation and messaging
    - Test payment reconciliation
    - Test analytics dashboard and charts
    - Test CSV exports
    - Test system health monitoring
    - Test role management (super_admin only)
    - _Requirements: All_

  - [ ] 20.6 Performance testing and optimization
    - Test dashboard load time (should be < 2 seconds)
    - Test search operations (should be < 500ms)
    - Test CSV export generation (should be < 5 seconds for 1 year)
    - Optimize slow queries with indexes
    - Implement caching where beneficial
    - _Requirements: 9.12, 18.1, 10.10_

  - [ ] 20.7 Security audit
    - Verify all admin routes are protected
    - Test rate limiting on all endpoints
    - Verify CSRF protection on all mutations
    - Test input sanitization
    - Verify sensitive data masking
    - Test IP blocking after failed logins
    - Review audit logging completeness
    - _Requirements: 1.1, 20.1, 20.3, 20.8, 20.9, 20.10_

  - [ ] 20.8 Documentation and deployment preparation
    - Update README.md with admin system setup instructions
    - Document environment variables in .env.example
    - Create admin user guide (how to use admin features)
    - Document API endpoints for future reference
    - Prepare deployment checklist
    - _Requirements: All_

- [ ] 21. Final Checkpoint - Complete System Verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows a 6-phase approach: Foundation → User Management → Support Tickets → Analytics → Transactions/System Health → Testing/Polish
- Checkpoints are placed after each major phase to ensure incremental validation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Database migration must be run before starting implementation
- Initial super admin must be created before testing admin features
- Email service integration is required for notification functionality
- All admin endpoints require authentication and rate limiting
- CSV exports are limited to 10,000 rows for performance
- System uses TypeScript throughout for type safety
- UI components use shadcn/ui (Radix UI + Tailwind CSS) for consistency
- Charts use Recharts library for data visualization
- Tables use TanStack Table for advanced features (sorting, filtering, pagination)

## Dependencies

The following npm packages need to be installed:

```json
{
  "recharts": "^2.10.0",
  "@tanstack/react-table": "^8.11.0",
  "@tanstack/react-query": "^5.17.0",
  "date-fns": "^3.0.0",
  "react-hot-toast": "^2.4.1",
  "xlsx": "^0.18.5",
  "fast-check": "^3.15.0"
}
```

## Environment Variables

Add to `.env`:

```bash
# Admin System
ADMIN_SECRET_KEY=your-secret-key-here
FIRST_SUPER_ADMIN_EMAIL=admin@verifynin.ng
FIRST_SUPER_ADMIN_PASSWORD=ChangeMe123!

# Email Service (Resend or similar)
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@verifynin.ng

# Rate Limiting (optional, for Redis)
REDIS_URL=redis://localhost:6379
```

## Success Criteria

Implementation is complete when:

1. All 21 task groups are completed
2. All non-optional tests pass (unit and property tests)
3. All 6 checkpoints are verified
4. Database migration is applied successfully
5. Initial super admin can log in and access all features
6. All admin pages load within performance targets
7. All API endpoints return correct data
8. All email notifications are sent correctly
9. All audit logging is working
10. Security measures are in place and tested
11. Documentation is complete and accurate

## Estimated Timeline

- Phase 1 (Foundation): 3-5 days
- Phase 2 (User Management): 5-7 days
- Phase 3 (Support Tickets): 7-10 days
- Phase 4 (Analytics): 5-7 days
- Phase 5 (Transactions/System Health): 7-10 days
- Phase 6 (Testing/Polish): 5-7 days

Total: 32-46 days (6-9 weeks) depending on team size and experience
