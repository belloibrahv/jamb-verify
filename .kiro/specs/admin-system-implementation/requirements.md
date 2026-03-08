# Requirements Document: Admin System Implementation

## Introduction

The VerifyNIN platform requires a comprehensive admin system to manage users, handle support tickets, reconcile payments, monitor analytics, and maintain system health. This admin system will enable support staff and administrators to efficiently operate the platform, resolve user issues, and gain insights into business metrics.

The system builds upon existing infrastructure including the database schema (already created in migration 0002_add_admin_system.sql), payment reconciliation capabilities, and audit logging. The admin system will provide role-based access control with three user roles: regular users, admins (support staff), and super admins (system administrators).

## Glossary

- **Admin_System**: The complete administrative interface and backend for managing the VerifyNIN platform
- **User**: A regular platform user who can verify NIDs and manage their wallet
- **Admin**: A support staff member with permissions to manage users, tickets, and transactions
- **Super_Admin**: A system administrator with full access including role management and system configuration
- **Support_Ticket**: A user-submitted request for help with payment issues, verification problems, or general questions
- **Ticket_Message**: A message in a support ticket conversation between user and admin
- **Admin_Action**: An auditable action performed by an admin (suspend user, reconcile payment, etc.)
- **Payment_Reconciliation**: The process of manually crediting a user's wallet when automatic payment processing fails
- **Analytics_Dashboard**: The main admin interface showing key metrics, charts, and recent activity
- **User_Management_System**: The interface for viewing, searching, filtering, and managing platform users
- **Transaction_Management_System**: The interface for viewing and managing all wallet transactions and verifications
- **System_Health_Monitor**: The interface for monitoring API status, errors, and webhook delivery
- **Verification_Record**: A NIN verification attempt with status, purpose, and result data
- **Wallet_Transaction**: A credit, debit, or refund operation on a user's wallet
- **Audit_Log**: A system-generated record of user and admin actions for compliance

## Requirements

### Requirement 1: Admin Authentication and Authorization

**User Story:** As a system administrator, I want role-based access control for the admin system, so that only authorized personnel can access administrative functions and sensitive data.

#### Acceptance Criteria

1. THE Admin_System SHALL restrict access to users with role 'admin' or 'super_admin'
2. WHEN a user without admin role attempts to access /admin routes, THE Admin_System SHALL redirect them to the user dashboard
3. WHEN an admin logs in, THE Admin_System SHALL include their role in the session data
4. THE Admin_System SHALL display different navigation options based on user role (admin vs super_admin)
5. WHEN a super_admin accesses user management, THE Admin_System SHALL allow role changes
6. WHEN an admin (non-super) accesses user management, THE Admin_System SHALL hide role change functionality
7. THE Admin_System SHALL log all admin authentication attempts in the audit log

### Requirement 2: User Management Interface

**User Story:** As an admin, I want to view and manage all platform users, so that I can assist users, investigate issues, and maintain platform integrity.

#### Acceptance Criteria

1. WHEN an admin accesses the user management page, THE Admin_System SHALL display a paginated list of all users
2. THE Admin_System SHALL provide search functionality by email, full name, and phone number
3. THE Admin_System SHALL provide filters for user role, suspension status, and registration date range
4. THE Admin_System SHALL provide sorting by registration date, wallet balance, and last activity
5. WHEN an admin views a user's details, THE Admin_System SHALL display full name, email, phone, wallet balance, role, suspension status, registration date, and activity summary
6. WHEN an admin views a user's details, THE Admin_System SHALL display the user's transaction history with pagination
7. WHEN an admin views a user's details, THE Admin_System SHALL display the user's verification history with pagination
8. THE Admin_System SHALL display results with pagination of 50 users per page
9. WHEN search or filter parameters change, THE Admin_System SHALL update results within 500ms

### Requirement 3: User Suspension and Activation

**User Story:** As an admin, I want to suspend and reactivate user accounts, so that I can prevent abuse and restore access when issues are resolved.

#### Acceptance Criteria

1. WHEN an admin suspends a user, THE Admin_System SHALL set is_suspended to true, record suspended_at timestamp, and store the suspension reason
2. WHEN an admin suspends a user, THE Admin_System SHALL log the action in admin_actions table with admin_id, target_user_id, and reason
3. WHEN a suspended user attempts to log in, THE Admin_System SHALL deny access and display the suspension reason
4. WHEN a suspended user attempts to perform any action, THE Admin_System SHALL return an error indicating account suspension
5. WHEN an admin reactivates a suspended user, THE Admin_System SHALL set is_suspended to false and clear suspended_at and suspended_reason
6. WHEN an admin reactivates a user, THE Admin_System SHALL log the reactivation in admin_actions table
7. THE Admin_System SHALL require a suspension reason with minimum length of 10 characters

### Requirement 4: Support Ticket Creation (User Side)

**User Story:** As a user, I want to submit support tickets for payment issues or verification problems, so that I can get help from the support team.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a ticket submission form accessible from the user dashboard
2. THE Admin_System SHALL require ticket type selection from: payment_issue, verification_issue, account_issue, technical_issue, general
3. THE Admin_System SHALL require a subject with minimum length of 5 characters and maximum length of 200 characters
4. THE Admin_System SHALL require a description with minimum length of 20 characters and maximum length of 2000 characters
5. WHEN ticket type is payment_issue, THE Admin_System SHALL require a payment reference
6. WHEN ticket type is verification_issue, THE Admin_System SHALL allow optional verification_id selection from user's verifications
7. WHEN a user submits a ticket, THE Admin_System SHALL create a support_tickets record with status 'open' and priority 'medium'
8. WHEN a user submits a ticket, THE Admin_System SHALL generate a unique ticket ID with format 'T-' followed by 8 alphanumeric characters
9. WHEN a ticket is created, THE Admin_System SHALL send an email confirmation to the user with the ticket ID
10. THE Admin_System SHALL allow users to view their own tickets with status and last update time

### Requirement 5: Support Ticket Management (Admin Side)

**User Story:** As an admin, I want to view, filter, and manage all support tickets, so that I can efficiently respond to user issues and track resolution progress.

#### Acceptance Criteria

1. WHEN an admin accesses the tickets page, THE Admin_System SHALL display all tickets sorted by created_at descending
2. THE Admin_System SHALL provide filters for ticket status (open, in_progress, resolved, closed)
3. THE Admin_System SHALL provide filters for ticket priority (low, medium, high, urgent)
4. THE Admin_System SHALL provide filters for ticket type
5. THE Admin_System SHALL provide search by ticket ID, user email, and subject
6. THE Admin_System SHALL display ticket cards with priority indicator, ticket ID, subject, user email, creation time, and type
7. WHEN an admin clicks a ticket, THE Admin_System SHALL navigate to the ticket detail page
8. THE Admin_System SHALL display a count of open tickets requiring response in the admin header
9. THE Admin_System SHALL highlight urgent priority tickets with red color coding
10. THE Admin_System SHALL display tickets with pagination of 20 tickets per page

### Requirement 6: Ticket Detail and Messaging

**User Story:** As an admin, I want to view ticket details and communicate with users, so that I can understand issues and provide solutions.

#### Acceptance Criteria

1. WHEN an admin views a ticket detail page, THE Admin_System SHALL display the complete conversation thread in chronological order
2. THE Admin_System SHALL display user information sidebar with full name, email, phone, wallet balance, and join date
3. WHEN the ticket is a payment_issue, THE Admin_System SHALL display payment details including reference, amount, status, and date
4. WHEN the ticket is a verification_issue, THE Admin_System SHALL display verification details including NIN (masked), status, and error message
5. THE Admin_System SHALL provide a message input form for admins to respond to tickets
6. WHEN an admin sends a message, THE Admin_System SHALL create a ticket_messages record with is_admin set to true
7. WHEN an admin sends a message, THE Admin_System SHALL send an email notification to the user
8. THE Admin_System SHALL display message sender (user or admin name) and timestamp for each message
9. THE Admin_System SHALL provide an internal notes section visible only to admins (is_internal = true)
10. THE Admin_System SHALL update ticket updated_at timestamp when any message is added

### Requirement 7: Ticket Status Management

**User Story:** As an admin, I want to change ticket status and assign tickets, so that I can track progress and distribute workload among support staff.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a status dropdown with options: open, in_progress, resolved, closed
2. WHEN an admin changes ticket status to 'in_progress', THE Admin_System SHALL update the status and log the action
3. WHEN an admin changes ticket status to 'resolved', THE Admin_System SHALL set resolved_at timestamp and log the action
4. WHEN an admin changes ticket status to 'closed', THE Admin_System SHALL prevent further status changes
5. THE Admin_System SHALL provide an assignment dropdown listing all users with role 'admin' or 'super_admin'
6. WHEN an admin assigns a ticket, THE Admin_System SHALL set assigned_to field and log the action
7. WHEN a ticket is assigned, THE Admin_System SHALL send an email notification to the assigned admin
8. THE Admin_System SHALL allow admins to assign tickets to themselves with a quick "Assign to Me" button
9. WHEN ticket status changes, THE Admin_System SHALL send an email notification to the user
10. THE Admin_System SHALL log all status changes in admin_actions table

### Requirement 8: Payment Reconciliation from Tickets

**User Story:** As an admin, I want to reconcile failed payments directly from support tickets, so that I can quickly resolve payment issues without switching interfaces.

#### Acceptance Criteria

1. WHEN a ticket type is payment_issue and payment_reference is provided, THE Admin_System SHALL display a "Reconcile Payment" button
2. WHEN an admin clicks "Reconcile Payment", THE Admin_System SHALL call the existing /api/admin/reconcile-payment endpoint
3. WHEN payment reconciliation succeeds, THE Admin_System SHALL automatically change ticket status to 'resolved'
4. WHEN payment reconciliation succeeds, THE Admin_System SHALL add an automated message to the ticket indicating successful reconciliation
5. WHEN payment reconciliation fails, THE Admin_System SHALL display the error message to the admin
6. THE Admin_System SHALL log payment reconciliation actions in admin_actions table with payment reference and amount
7. WHEN payment is reconciled, THE Admin_System SHALL send an email notification to the user confirming wallet credit

### Requirement 9: Analytics Dashboard

**User Story:** As an admin, I want to view key platform metrics and charts, so that I can monitor business performance and identify trends.

#### Acceptance Criteria

1. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display total users count
2. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display active users count (users with activity in last 30 days)
3. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display total revenue for current month
4. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display pending tickets count (status = open or in_progress)
5. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display verification success rate as percentage
6. WHEN an admin accesses the main dashboard, THE Admin_System SHALL display average transaction value
7. THE Admin_System SHALL display a user growth line chart showing daily registrations for the last 30 days
8. THE Admin_System SHALL display a revenue bar chart showing daily revenue for the last 30 days
9. THE Admin_System SHALL display a verification success/failure pie chart for the current month
10. THE Admin_System SHALL display recent activity feed showing last 10 events (registrations, verifications, payments, tickets)
11. THE Admin_System SHALL calculate and display percentage change for each metric compared to previous period
12. THE Admin_System SHALL refresh dashboard metrics every 60 seconds without page reload

### Requirement 10: Advanced Analytics

**User Story:** As an admin, I want detailed analytics with date range filters and export capabilities, so that I can generate reports and analyze historical data.

#### Acceptance Criteria

1. THE Admin_System SHALL provide date range filters with presets: Last 7 Days, Last 30 Days, Last 90 Days, Custom Range
2. WHEN a date range is selected, THE Admin_System SHALL update all charts and metrics to reflect the selected period
3. THE Admin_System SHALL display revenue trend chart with daily, weekly, or monthly granularity based on date range
4. THE Admin_System SHALL display user growth chart with registration counts over time
5. THE Admin_System SHALL display verification success rate trend over time
6. THE Admin_System SHALL calculate and display average revenue per user (ARPU)
7. THE Admin_System SHALL calculate and display daily active users average
8. THE Admin_System SHALL calculate and display conversion rate (registrations to first verification)
9. THE Admin_System SHALL provide export to CSV functionality for all metrics tables
10. THE Admin_System SHALL generate CSV exports within 5 seconds for date ranges up to 1 year

### Requirement 11: Transaction Management

**User Story:** As an admin, I want to view and manage all wallet transactions and verifications, so that I can investigate payment issues and monitor platform activity.

#### Acceptance Criteria

1. WHEN an admin accesses the transactions page, THE Admin_System SHALL display all wallet_transactions sorted by created_at descending
2. THE Admin_System SHALL provide filters for transaction type (credit, debit, refund)
3. THE Admin_System SHALL provide filters for transaction status (pending, completed, failed, refunded)
4. THE Admin_System SHALL provide date range filter for transaction date
5. THE Admin_System SHALL provide search by payment reference, user email, and NIN (masked)
6. THE Admin_System SHALL display transaction details including date/time, user email, type, amount, status, and reference
7. WHEN an admin clicks a transaction, THE Admin_System SHALL display full transaction details including provider data and metadata
8. THE Admin_System SHALL provide export to CSV functionality for filtered transaction lists
9. THE Admin_System SHALL display transaction summary showing total count, total volume, and success rate
10. THE Admin_System SHALL display transactions with pagination of 50 transactions per page

### Requirement 12: Verification Management

**User Story:** As an admin, I want to view all NIN verifications with details, so that I can investigate verification failures and monitor verification patterns.

#### Acceptance Criteria

1. WHEN an admin accesses the verifications section, THE Admin_System SHALL display all nin_verifications sorted by created_at descending
2. THE Admin_System SHALL provide filters for verification status (pending, success, failed)
3. THE Admin_System SHALL provide filters for verification purpose
4. THE Admin_System SHALL provide date range filter for verification date
5. THE Admin_System SHALL provide search by user email and NIN (masked)
6. THE Admin_System SHALL display verification details including date/time, user email, NIN (masked), status, purpose, and provider reference
7. WHEN an admin clicks a verification, THE Admin_System SHALL display full verification details including error message and raw response
8. THE Admin_System SHALL display verification summary showing total count, success count, failure count, and success rate
9. THE Admin_System SHALL provide export to CSV functionality for filtered verification lists
10. THE Admin_System SHALL display verifications with pagination of 50 verifications per page

### Requirement 13: Admin Action Logging

**User Story:** As a super admin, I want all admin actions logged for audit purposes, so that I can maintain accountability and investigate issues.

#### Acceptance Criteria

1. WHEN an admin suspends a user, THE Admin_System SHALL create an admin_actions record with action_type 'user_suspended'
2. WHEN an admin reactivates a user, THE Admin_System SHALL create an admin_actions record with action_type 'user_activated'
3. WHEN an admin changes a user's role, THE Admin_System SHALL create an admin_actions record with action_type 'role_changed'
4. WHEN an admin reconciles a payment, THE Admin_System SHALL create an admin_actions record with action_type 'payment_reconciled'
5. WHEN an admin resolves a ticket, THE Admin_System SHALL create an admin_actions record with action_type 'ticket_resolved'
6. WHEN an admin processes a refund, THE Admin_System SHALL create an admin_actions record with action_type 'transaction_refunded'
7. THE Admin_System SHALL store admin_id, target_user_id, target_resource, description, IP address, and user agent for each action
8. THE Admin_System SHALL store action metadata as JSON including old values and new values for changes
9. WHEN a super_admin accesses the admin actions log, THE Admin_System SHALL display all actions with filters for admin, action type, and date range
10. THE Admin_System SHALL provide export to CSV functionality for admin action logs

### Requirement 14: System Health Monitoring

**User Story:** As an admin, I want to monitor system health and API status, so that I can identify and respond to technical issues quickly.

#### Acceptance Criteria

1. WHEN an admin accesses the system health page, THE Admin_System SHALL display API status (healthy, degraded, down)
2. WHEN an admin accesses the system health page, THE Admin_System SHALL display database status (healthy, degraded, down)
3. WHEN an admin accesses the system health page, THE Admin_System SHALL display Paystack API status based on recent transaction success rate
4. WHEN an admin accesses the system health page, THE Admin_System SHALL display YouVerify API status based on recent verification success rate
5. THE Admin_System SHALL display webhook delivery status showing delivered count, failed count, and delivery rate
6. THE Admin_System SHALL display API response time chart for the last hour with 5-minute intervals
7. THE Admin_System SHALL display recent errors log showing last 50 errors with timestamp, error type, and message
8. WHEN webhook delivery rate falls below 95%, THE Admin_System SHALL display a warning indicator
9. WHEN API response time exceeds 1000ms average, THE Admin_System SHALL display a warning indicator
10. THE Admin_System SHALL refresh system health metrics every 30 seconds without page reload

### Requirement 15: Role Management (Super Admin Only)

**User Story:** As a super admin, I want to change user roles, so that I can promote users to admin or demote admins to regular users.

#### Acceptance Criteria

1. WHEN a super_admin views a user's details, THE Admin_System SHALL display a role change dropdown
2. THE Admin_System SHALL allow super_admin to change user role to: user, admin, super_admin
3. WHEN a super_admin changes a user's role, THE Admin_System SHALL update the users.role field
4. WHEN a super_admin changes a user's role, THE Admin_System SHALL log the action in admin_actions table with old role and new role
5. WHEN a user with role 'admin' (non-super) views user details, THE Admin_System SHALL hide the role change dropdown
6. THE Admin_System SHALL prevent a super_admin from changing their own role
7. WHEN a user's role is changed to 'admin' or 'super_admin', THE Admin_System SHALL send an email notification to the user
8. WHEN a user's role is changed from 'admin' or 'super_admin' to 'user', THE Admin_System SHALL revoke access to /admin routes immediately

### Requirement 16: Admin Layout and Navigation

**User Story:** As an admin, I want a consistent admin interface with navigation, so that I can easily access different admin functions.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a sidebar navigation with links to: Dashboard, Users, Tickets, Transactions, Analytics, System Health
2. WHEN a super_admin is logged in, THE Admin_System SHALL display an additional "Admin Actions Log" link in navigation
3. THE Admin_System SHALL highlight the current page in the sidebar navigation
4. THE Admin_System SHALL display the admin's name and role in the header
5. THE Admin_System SHALL provide a logout button in the header
6. THE Admin_System SHALL display a notification badge on the Tickets navigation item showing count of open tickets
7. THE Admin_System SHALL be responsive and collapse sidebar to hamburger menu on screens smaller than 768px
8. THE Admin_System SHALL maintain consistent styling using the existing Tailwind CSS configuration
9. THE Admin_System SHALL display a breadcrumb navigation showing current location
10. THE Admin_System SHALL provide a quick search bar in the header for searching users, tickets, and transactions

### Requirement 17: Email Notifications

**User Story:** As a user, I want to receive email notifications for ticket updates, so that I stay informed about my support requests.

#### Acceptance Criteria

1. WHEN a user creates a ticket, THE Admin_System SHALL send an email with ticket ID and confirmation message
2. WHEN an admin responds to a ticket, THE Admin_System SHALL send an email to the user with the admin's message
3. WHEN a ticket status changes to 'resolved', THE Admin_System SHALL send an email to the user with resolution details
4. WHEN a payment is reconciled, THE Admin_System SHALL send an email to the user confirming wallet credit
5. WHEN a ticket is assigned to an admin, THE Admin_System SHALL send an email to the assigned admin
6. THE Admin_System SHALL include ticket ID, subject, and direct link to ticket in all notification emails
7. THE Admin_System SHALL use the platform's branding and styling in email templates
8. THE Admin_System SHALL send emails from noreply@verifynin.ng
9. WHEN email delivery fails, THE Admin_System SHALL log the failure in audit_logs
10. THE Admin_System SHALL not send duplicate notifications for the same event within 5 minutes

### Requirement 18: Search and Filter Performance

**User Story:** As an admin, I want fast search and filter operations, so that I can quickly find users, tickets, and transactions.

#### Acceptance Criteria

1. WHEN an admin searches users by email, THE Admin_System SHALL return results within 300ms for databases with up to 100,000 users
2. WHEN an admin searches tickets by ID, THE Admin_System SHALL return results within 200ms
3. WHEN an admin applies multiple filters, THE Admin_System SHALL combine filters with AND logic
4. THE Admin_System SHALL use database indexes on frequently queried fields (email, ticket status, transaction reference)
5. WHEN search returns more than 1000 results, THE Admin_System SHALL display a message suggesting more specific search criteria
6. THE Admin_System SHALL debounce search input with 300ms delay to reduce unnecessary queries
7. THE Admin_System SHALL display a loading indicator during search and filter operations
8. WHEN a search or filter operation takes longer than 1 second, THE Admin_System SHALL display a timeout warning
9. THE Admin_System SHALL cache frequently accessed data (user counts, ticket counts) for 60 seconds
10. THE Admin_System SHALL use pagination to limit query result size to maximum 100 records per query

### Requirement 19: Data Export Functionality

**User Story:** As an admin, I want to export data to CSV format, so that I can analyze data in spreadsheet applications and generate reports.

#### Acceptance Criteria

1. WHEN an admin clicks "Export CSV" on the users page, THE Admin_System SHALL generate a CSV file with all filtered users
2. WHEN an admin clicks "Export CSV" on the transactions page, THE Admin_System SHALL generate a CSV file with all filtered transactions
3. WHEN an admin clicks "Export CSV" on the verifications page, THE Admin_System SHALL generate a CSV file with all filtered verifications
4. WHEN an admin clicks "Export CSV" on the analytics page, THE Admin_System SHALL generate a CSV file with metrics data
5. THE Admin_System SHALL include column headers in the first row of CSV exports
6. THE Admin_System SHALL format currency values in CSV exports as numbers without currency symbols
7. THE Admin_System SHALL format dates in CSV exports as ISO 8601 format (YYYY-MM-DD HH:mm:ss)
8. THE Admin_System SHALL limit CSV exports to 10,000 rows per file
9. WHEN export exceeds 10,000 rows, THE Admin_System SHALL display a message suggesting date range filters
10. THE Admin_System SHALL generate CSV file name with format: {resource}_{date}_{time}.csv

### Requirement 20: Security and Rate Limiting

**User Story:** As a system administrator, I want admin endpoints protected with rate limiting and security measures, so that the admin system is protected from abuse and unauthorized access.

#### Acceptance Criteria

1. THE Admin_System SHALL apply rate limiting of 100 requests per minute per admin user on all admin API endpoints
2. WHEN rate limit is exceeded, THE Admin_System SHALL return HTTP 429 status with retry-after header
3. THE Admin_System SHALL validate admin session on every admin API request
4. WHEN admin session is invalid or expired, THE Admin_System SHALL return HTTP 401 status
5. THE Admin_System SHALL log all failed authentication attempts in audit_logs with IP address
6. WHEN 5 failed authentication attempts occur from same IP within 10 minutes, THE Admin_System SHALL temporarily block that IP for 30 minutes
7. THE Admin_System SHALL use HTTPS for all admin routes in production
8. THE Admin_System SHALL include CSRF token validation for all state-changing admin operations
9. THE Admin_System SHALL sanitize all user input to prevent XSS attacks
10. THE Admin_System SHALL mask sensitive data (full NIN, password hashes) in all admin interfaces and logs
