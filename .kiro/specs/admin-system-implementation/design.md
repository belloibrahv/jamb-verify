# Design Document: Admin System Implementation

## Overview

The Admin System Implementation provides a comprehensive administrative interface for the VerifyNIN platform, enabling support staff and system administrators to manage users, handle support tickets, reconcile payments, monitor analytics, and maintain system health. This system builds upon existing infrastructure including database schema (migration 0002_add_admin_system.sql), payment reconciliation API, audit logging utilities, and rate limiting mechanisms.

### Goals

- Provide role-based access control with three user roles (user, admin, super_admin)
- Enable efficient user management with search, filtering, and suspension capabilities
- Implement a support ticket system for handling payment issues and verification problems
- Integrate payment reconciliation directly into ticket workflows
- Deliver real-time analytics dashboard with key business metrics
- Monitor system health and API status
- Maintain comprehensive audit trails for compliance
- Ensure security through rate limiting and access controls

### Non-Goals

- Building a separate admin application (admin interface is part of the main Next.js app)
- Implementing custom authentication (uses existing auth system with role checks)
- Creating a mobile admin app (responsive web interface only)
- Real-time chat functionality (ticket messaging is asynchronous)
- Advanced BI/reporting tools (basic analytics and CSV export only)

### Success Metrics

- Average ticket resolution time < 2 hours
- Admin dashboard load time < 2 seconds
- Search and filter operations complete within 500ms
- 99% uptime for admin endpoints
- Zero unauthorized access to admin functions
- 100% of admin actions logged for audit compliance

## Architecture

### System Components

The admin system follows Next.js 15 App Router architecture with server-side rendering, server actions for mutations, and API routes for data fetching.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Pages  │  │ Admin Layout │  │ UI Components│     │
│  │ (RSC)        │  │ (Navigation) │  │ (shadcn/ui)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/RSC
┌─────────────────────────────────────────────────────────────┐
│                     Server Layer (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Middleware   │  │ Server       │  │ API Routes   │     │
│  │ (Auth/RBAC)  │  │ Actions      │  │ (Data Fetch) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin        │  │ Audit        │  │ Rate         │     │
│  │ Services     │  │ Logging      │  │ Limiting     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ users        │  │ support_     │  │ admin_       │     │
│  │ (with role)  │  │ tickets      │  │ actions      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ wallet_      │  │ nin_         │  │ audit_       │     │
│  │ transactions │  │ verifications│  │ logs         │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Authentication and Authorization Flow

```
User Request → Middleware → Check Session → Check Role → Allow/Deny
                    ↓
              Session exists?
                    ↓
              Role = admin or super_admin?
                    ↓
              Route-specific permissions?
                    ↓
              Proceed to handler
```

### Data Flow Patterns

1. **Read Operations (Analytics, Lists)**
   - Client → API Route → Database Query → Response
   - Caching: 60 seconds for dashboard metrics
   - Pagination: 50 items per page (users, transactions)

2. **Write Operations (Suspend User, Resolve Ticket)**
   - Client → Server Action → Validation → Database Update → Audit Log → Response
   - All mutations logged in admin_actions table
   - Email notifications triggered asynchronously

3. **Payment Reconciliation**
   - Admin → Ticket Detail → Reconcile Button → Server Action
   - Verify with Paystack → Update Wallet → Update Ticket → Audit Log → Email User

## Components and Interfaces

### Page Components

#### 1. Admin Dashboard (`/admin/page.tsx`)

Main analytics dashboard displaying key metrics and charts.

**Props:** None (server component fetches data)

**Data Sources:**
- Total users count from `users` table
- Active users from `audit_logs` (last 30 days)
- Monthly revenue from `wallet_transactions`
- Pending tickets from `support_tickets`
- Verification success rate from `nin_verifications`

**UI Components:**
- MetricCard (displays metric with trend)
- LineChart (user growth)
- BarChart (revenue)
- PieChart (verification success/failure)
- ActivityFeed (recent events)

#### 2. User Management (`/admin/users/page.tsx`)

Paginated user list with search and filters.

**Query Parameters:**
- `page`: number (default: 1)
- `search`: string (email, name, phone)
- `role`: 'user' | 'admin' | 'super_admin'
- `suspended`: boolean
- `sortBy`: 'created_at' | 'balance' | 'last_activity'
- `sortOrder`: 'asc' | 'desc'

**Server Actions:**
- `suspendUser(userId, reason)`
- `activateUser(userId)`
- `changeUserRole(userId, newRole)` (super_admin only)

#### 3. User Detail Modal (`/admin/users/[id]/page.tsx`)

Detailed user information with transaction and verification history.

**Data Displayed:**
- User profile (name, email, phone, role, status)
- Wallet balance
- Transaction history (paginated)
- Verification history (paginated)
- Support tickets
- Activity summary

#### 4. Support Tickets (`/admin/tickets/page.tsx`)

Ticket list with filtering and status management.

**Query Parameters:**
- `status`: 'open' | 'in_progress' | 'resolved' | 'closed'
- `priority`: 'low' | 'medium' | 'high' | 'urgent'
- `type`: ticket type enum
- `search`: string (ticket ID, user email)

**Server Actions:**
- `updateTicketStatus(ticketId, newStatus)`
- `assignTicket(ticketId, adminId)`
- `sendTicketMessage(ticketId, message, isInternal)`

#### 5. Ticket Detail (`/admin/tickets/[id]/page.tsx`)

Full ticket conversation with user info and reconciliation tools.

**Components:**
- ConversationThread (messages chronologically)
- UserInfoSidebar (user details, wallet balance)
- PaymentDetailCard (for payment_issue tickets)
- VerificationDetailCard (for verification_issue tickets)
- MessageInput (admin response form)
- InternalNotes (admin-only notes)
- StatusDropdown (change ticket status)
- AssignmentDropdown (assign to admin)

**Server Actions:**
- `reconcilePaymentFromTicket(ticketId, reference)`
- `addTicketMessage(ticketId, message, isInternal)`
- `updateTicketStatus(ticketId, status)`
- `assignTicket(ticketId, adminId)`

#### 6. Transactions (`/admin/transactions/page.tsx`)

All wallet transactions with advanced filtering.

**Query Parameters:**
- `type`: 'credit' | 'debit' | 'refund'
- `status`: transaction status enum
- `dateFrom`: ISO date string
- `dateTo`: ISO date string
- `search`: string (reference, email)

**Features:**
- Export to CSV
- Transaction summary (count, volume, success rate)
- Transaction detail modal

#### 7. Analytics (`/admin/analytics/page.tsx`)

Advanced analytics with date range filters and charts.

**Query Parameters:**
- `dateRange`: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'
- `dateFrom`: ISO date string (for custom)
- `dateTo`: ISO date string (for custom)

**Metrics Calculated:**
- Revenue trend (daily/weekly/monthly)
- User growth rate
- Average revenue per user (ARPU)
- Conversion rate (registration → verification)
- Daily active users
- Verification success rate trend

#### 8. System Health (`/admin/system/page.tsx`)

System monitoring dashboard.

**Metrics Displayed:**
- API status (based on recent error rate)
- Database status (connection health)
- Paystack API status (transaction success rate)
- YouVerify API status (verification success rate)
- Webhook delivery rate
- API response time chart
- Recent errors log

#### 9. Admin Actions Log (`/admin/actions/page.tsx`)

Audit log of all admin actions (super_admin only).

**Query Parameters:**
- `adminId`: filter by admin user
- `actionType`: filter by action type
- `dateFrom`: ISO date string
- `dateTo`: ISO date string

**Features:**
- Export to CSV
- Detailed action metadata view

### UI Component Library

#### MetricCard

Displays a single metric with icon, value, and trend.

```typescript
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string; // e.g., "+12%"
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'red';
}
```

#### StatusBadge

Displays status with color coding.

```typescript
interface StatusBadgeProps {
  status: 'active' | 'suspended' | 'pending' | 'completed' | 'failed';
  variant?: 'default' | 'outline';
}
```

#### PriorityBadge

Displays ticket priority with color coding.

```typescript
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
```

#### DataTable

Reusable table component with sorting, filtering, and pagination.

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}
```

#### ActionMenu

Dropdown menu for row actions.

```typescript
interface ActionMenuProps {
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }[];
}
```

### API Endpoints

#### Admin User Management

**GET /api/admin/users**
- Query params: page, search, role, suspended, sortBy, sortOrder
- Returns: `{ users: User[], pagination: PaginationInfo }`
- Rate limit: 100 req/min per admin

**GET /api/admin/users/[id]**
- Returns: `{ user: UserDetail, transactions: Transaction[], verifications: Verification[] }`
- Rate limit: 100 req/min per admin

**PATCH /api/admin/users/[id]/suspend**
- Body: `{ reason: string }`
- Returns: `{ success: boolean, user: User }`
- Logs: admin_actions table

**PATCH /api/admin/users/[id]/activate**
- Returns: `{ success: boolean, user: User }`
- Logs: admin_actions table

**PATCH /api/admin/users/[id]/role** (super_admin only)
- Body: `{ role: 'user' | 'admin' | 'super_admin' }`
- Returns: `{ success: boolean, user: User }`
- Logs: admin_actions table

#### Admin Analytics

**GET /api/admin/analytics/overview**
- Returns: `{ totalUsers, activeUsers, monthlyRevenue, pendingTickets, successRate, avgTransactionValue, trends }`
- Cache: 60 seconds
- Rate limit: 100 req/min per admin

**GET /api/admin/analytics/revenue**
- Query params: dateFrom, dateTo, granularity
- Returns: `{ data: { date: string, revenue: number }[] }`
- Rate limit: 100 req/min per admin

**GET /api/admin/analytics/users**
- Query params: dateFrom, dateTo
- Returns: `{ data: { date: string, count: number }[] }`
- Rate limit: 100 req/min per admin

#### Support Tickets

**POST /api/tickets** (user endpoint)
- Body: `{ type, subject, description, paymentReference?, verificationId? }`
- Returns: `{ ticket: Ticket }`
- Rate limit: 10 req/hour per user
- Sends: email confirmation

**GET /api/tickets** (user endpoint)
- Returns: `{ tickets: Ticket[] }`
- Rate limit: 30 req/min per user

**GET /api/admin/tickets**
- Query params: status, priority, type, search, page
- Returns: `{ tickets: Ticket[], pagination: PaginationInfo }`
- Rate limit: 100 req/min per admin

**GET /api/admin/tickets/[id]**
- Returns: `{ ticket: TicketDetail, messages: Message[], user: UserInfo }`
- Rate limit: 100 req/min per admin

**PATCH /api/admin/tickets/[id]/status**
- Body: `{ status: TicketStatus }`
- Returns: `{ success: boolean, ticket: Ticket }`
- Logs: admin_actions table
- Sends: email to user

**POST /api/admin/tickets/[id]/messages**
- Body: `{ message: string, isInternal: boolean }`
- Returns: `{ success: boolean, message: Message }`
- Sends: email to user (if not internal)

**POST /api/admin/tickets/[id]/assign**
- Body: `{ adminId: string }`
- Returns: `{ success: boolean, ticket: Ticket }`
- Logs: admin_actions table
- Sends: email to assigned admin

**POST /api/admin/tickets/[id]/reconcile**
- Body: `{ reference: string }`
- Calls: existing /api/admin/reconcile-payment
- Updates: ticket status to 'resolved'
- Logs: admin_actions table
- Sends: email to user

#### Admin Transactions

**GET /api/admin/transactions**
- Query params: type, status, dateFrom, dateTo, search, page
- Returns: `{ transactions: Transaction[], summary: Summary, pagination: PaginationInfo }`
- Rate limit: 100 req/min per admin

**GET /api/admin/transactions/[id]**
- Returns: `{ transaction: TransactionDetail }`
- Rate limit: 100 req/min per admin

**POST /api/admin/transactions/export**
- Body: `{ filters: FilterParams }`
- Returns: CSV file
- Rate limit: 10 req/hour per admin

#### System Monitoring

**GET /api/admin/system/health**
- Returns: `{ api, database, paystack, youverify, webhooks, responseTime }`
- Cache: 30 seconds
- Rate limit: 100 req/min per admin

**GET /api/admin/system/errors**
- Query params: limit, offset
- Returns: `{ errors: Error[] }`
- Rate limit: 100 req/min per admin

**GET /api/admin/actions**
- Query params: adminId, actionType, dateFrom, dateTo, page
- Returns: `{ actions: AdminAction[], pagination: PaginationInfo }`
- Rate limit: 100 req/min per admin
- Access: super_admin only

## Data Models

### Extended User Model

```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'super_admin';
  isSuspended: boolean;
  suspendedAt: Date | null;
  suspendedReason: string | null;
  createdAt: Date;
}
```

### Support Ticket Model

```typescript
interface SupportTicket {
  id: string; // Format: T-XXXXXXXX
  userId: string;
  type: 'payment_issue' | 'verification_issue' | 'account_issue' | 'technical_issue' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string; // 5-200 chars
  description: string; // 20-2000 chars
  paymentReference: string | null;
  verificationId: string | null;
  assignedTo: string | null; // admin user id
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}
```

### Ticket Message Model

```typescript
interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  isInternal: boolean; // Only visible to admins
  attachments: { name: string; url: string }[] | null;
  createdAt: Date;
}
```

### Admin Action Model

```typescript
interface AdminAction {
  id: string;
  adminId: string;
  actionType: string; // 'user_suspended', 'payment_reconciled', etc.
  targetUserId: string | null;
  targetResource: string | null; // ticket_id, transaction_id, etc.
  description: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
```

### Analytics Models

```typescript
interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number; // Last 30 days
  monthlyRevenue: number; // Current month in kobo
  pendingTickets: number;
  verificationSuccessRate: number; // Percentage
  avgTransactionValue: number; // In kobo
  trends: {
    users: string; // e.g., "+12%"
    revenue: string;
    successRate: string;
    tickets: string;
  };
}

interface RevenueData {
  date: string; // ISO date
  revenue: number; // In kobo
}

interface UserGrowthData {
  date: string;
  count: number;
}

interface VerificationStats {
  status: 'success' | 'failed' | 'pending';
  count: number;
}
```

### System Health Models

```typescript
interface SystemHealth {
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number; // Average in ms
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connectionCount: number;
  };
  paystack: {
    status: 'healthy' | 'degraded' | 'down';
    successRate: number; // Percentage
  };
  youverify: {
    status: 'healthy' | 'degraded' | 'down';
    successRate: number;
  };
  webhooks: {
    deliveryRate: number; // Percentage
    failedCount: number;
    pendingRetry: number;
  };
}

interface APIResponseTime {
  timestamp: string;
  avgResponseTime: number; // In ms
}

interface SystemError {
  id: string;
  timestamp: Date;
  errorType: string;
  message: string;
  stack: string | null;
  endpoint: string;
  userId: string | null;
}
```



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Admin Access Control

For any user with role 'user', attempting to access any /admin route should result in denial of access (redirect or 401 status).

**Validates: Requirements 1.1, 1.2**

### Property 2: Admin Session Role Inclusion

For any user with role 'admin' or 'super_admin', after successful login, the session data should contain the role field with the correct value.

**Validates: Requirements 1.3**

### Property 3: User List Pagination Size

For any user management query, each page of results should contain at most 50 users.

**Validates: Requirements 2.8**

### Property 4: User Search Completeness

For any user in the database, searching by their exact email, full name, or phone number should return that user in the search results.

**Validates: Requirements 2.2**

### Property 5: User Suspension State

For any user and valid suspension reason (≥10 characters), after suspension the user record should have is_suspended=true, suspended_at timestamp set, and suspended_reason stored.

**Validates: Requirements 3.1, 3.7**

### Property 6: Suspension Audit Logging

For any user suspension operation, there should exist a corresponding admin_actions record with action_type='user_suspended', correct admin_id, target_user_id, and reason.

**Validates: Requirements 3.2, 13.1**

### Property 7: Suspended User Login Denial

For any user with is_suspended=true, login attempts should fail and return the suspension reason.

**Validates: Requirements 3.3**

### Property 8: Ticket Subject Validation

For any ticket submission with subject length outside the range [5, 200] characters, the submission should be rejected with a validation error.

**Validates: Requirements 4.3**

### Property 9: Ticket Description Validation

For any ticket submission with description length outside the range [20, 2000] characters, the submission should be rejected with a validation error.

**Validates: Requirements 4.4**

### Property 10: Ticket ID Format

For any created ticket, the ticket ID should match the pattern /^T-[A-Za-z0-9]{8}$/ and be unique.

**Validates: Requirements 4.8**

### Property 11: Ticket List Sort Order

For any set of tickets returned by the admin tickets endpoint, they should be ordered by created_at in descending order (newest first).

**Validates: Requirements 5.1**

### Property 12: Ticket Pagination Size

For any ticket list query, each page of results should contain at most 20 tickets.

**Validates: Requirements 5.10**

### Property 13: Ticket Message Chronological Order

For any ticket with multiple messages, the messages should be ordered by created_at in ascending order (oldest first).

**Validates: Requirements 6.1**

### Property 14: Admin Message Flag

For any message sent by a user with role 'admin' or 'super_admin', the created ticket_messages record should have is_admin=true.

**Validates: Requirements 6.6**

### Property 15: Ticket Updated Timestamp

For any ticket, adding a new message should update the ticket's updated_at timestamp to a value greater than the previous updated_at.

**Validates: Requirements 6.10**

### Property 16: Resolved Ticket Timestamp

For any ticket status change to 'resolved', the ticket's resolved_at field should be set to a non-null timestamp, and an admin_actions record should be created.

**Validates: Requirements 7.3**

### Property 17: Closed Ticket Immutability

For any ticket with status='closed', attempts to change the status to any other value should be rejected.

**Validates: Requirements 7.4**

### Property 18: Payment Reconciliation Workflow

For any successful payment reconciliation on a ticket, the ticket status should automatically change to 'resolved' and an automated message should be added to the ticket.

**Validates: Requirements 8.3, 8.4**

### Property 19: Percentage Change Calculation

For any two numeric values (current and previous), the calculated percentage change should equal ((current - previous) / previous) * 100, with proper handling of zero/null previous values.

**Validates: Requirements 9.11**

### Property 20: Transaction Summary Accuracy

For any set of transactions, the summary should correctly calculate: total count = number of transactions, total volume = sum of amounts, success rate = (completed count / total count) * 100.

**Validates: Requirements 11.9**

### Property 21: Admin Action Metadata Structure

For any admin action that modifies a field, the metadata should contain both oldValue and newValue fields with the correct values.

**Validates: Requirements 13.8**

### Property 22: Role Change Updates Database

For any user and new role, after a super_admin changes the role, the users.role field should be updated to the new value.

**Validates: Requirements 15.3**

### Property 23: Self-Role-Change Prevention

For any super_admin user, attempting to change their own role should be rejected with an error.

**Validates: Requirements 15.6**

### Property 24: Email Notification Deduplication

For any event that triggers an email notification, if a notification for the same event was sent to the same recipient within the last 5 minutes, a duplicate notification should not be sent.

**Validates: Requirements 17.10**

### Property 25: Filter Combination Logic

For any set of filters applied to a query, only records that match ALL filter conditions (AND logic) should be returned in the results.

**Validates: Requirements 18.3**

### Property 26: Data Caching Consistency

For any cached data (user counts, ticket counts), subsequent requests within 60 seconds should return the same value without querying the database.

**Validates: Requirements 18.9**

### Property 27: CSV Export Headers

For any CSV export, the first row should contain column headers matching the data fields in subsequent rows.

**Validates: Requirements 19.5**

### Property 28: CSV Export Row Limit

For any CSV export request, the generated file should contain at most 10,000 data rows (plus 1 header row).

**Validates: Requirements 19.8**

### Property 29: Rate Limit Enforcement

For any admin user making more than 100 requests to admin API endpoints within a 60-second window, subsequent requests should be rejected with HTTP 429 status.

**Validates: Requirements 20.1, 20.2**

### Property 30: Sensitive Data Masking

For any NIN or password hash displayed in admin interfaces or logs, the value should be masked (e.g., "***-***-1234" for NIN, never showing password hashes).

**Validates: Requirements 20.10**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid session: Return 401 with redirect to login
   - Insufficient permissions: Return 403 with error message
   - Session expired: Return 401 with session refresh prompt

2. **Validation Errors**
   - Invalid input: Return 400 with field-specific error messages
   - Missing required fields: Return 400 with list of missing fields
   - Format errors: Return 400 with format requirements

3. **Business Logic Errors**
   - Suspended user action: Return 403 with suspension reason
   - Closed ticket modification: Return 409 with conflict message
   - Self-role-change: Return 403 with explanation
   - Duplicate operation: Return 409 with existing resource info

4. **External Service Errors**
   - Paystack API failure: Retry 3 times, then return 503 with error message
   - Email service failure: Log error, queue for retry, return success to user
   - Database connection error: Return 503 with retry suggestion

5. **Rate Limit Errors**
   - Rate limit exceeded: Return 429 with retry-after header
   - Include remaining requests in response headers

6. **System Errors**
   - Unexpected errors: Return 500 with generic message
   - Log full error details for debugging
   - Never expose stack traces to clients

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable message
    details?: Record<string, string[]>; // Field-specific errors
    retryAfter?: number; // Seconds (for rate limits)
  };
}
```

### Error Logging

All errors are logged with:
- Timestamp
- Error type and message
- User ID (if authenticated)
- Request path and method
- IP address
- Stack trace (for 500 errors)
- Request body (sanitized, no passwords/tokens)

### Graceful Degradation

- Dashboard metrics: Show cached data if database query fails
- Charts: Display "Data temporarily unavailable" if calculation fails
- Search: Fall back to basic search if advanced filters fail
- Export: Offer smaller date range if full export times out

### User-Facing Error Messages

- Authentication: "Your session has expired. Please log in again."
- Permission: "You don't have permission to perform this action."
- Validation: "Please check the highlighted fields and try again."
- Rate limit: "Too many requests. Please wait {seconds} seconds."
- System error: "Something went wrong. Please try again or contact support."

## Testing Strategy

### Dual Testing Approach

The admin system requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

Unit tests should focus on:

1. **Specific Examples**
   - Admin can suspend a user with valid reason
   - Ticket status changes from 'open' to 'resolved'
   - Payment reconciliation updates wallet balance
   - CSV export generates correct format

2. **Edge Cases**
   - Empty search results
   - Single-item pagination
   - Ticket with no messages
   - User with zero balance
   - Metrics with no data

3. **Error Conditions**
   - Suspend user with reason < 10 characters (should fail)
   - Change closed ticket status (should fail)
   - Super admin changes own role (should fail)
   - Rate limit exceeded (should return 429)

4. **Integration Points**
   - Middleware correctly checks admin role
   - Server actions call audit logging
   - Email service receives correct parameters
   - Database transactions commit/rollback properly

### Property-Based Testing

Property tests should verify the 30 correctness properties defined above. Each property test should:

- Run minimum 100 iterations (due to randomization)
- Generate random valid inputs
- Verify the property holds for all inputs
- Include a comment tag referencing the design property

**Property Test Configuration:**

```typescript
// Example using fast-check (JavaScript/TypeScript)
import fc from 'fast-check';

// Tag format: Feature: admin-system-implementation, Property {number}: {property_text}
describe('Feature: admin-system-implementation, Property 5: User Suspension State', () => {
  it('should set suspension fields correctly for any user and valid reason', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          reason: fc.string({ minLength: 10, maxLength: 500 })
        }),
        async ({ userId, reason }) => {
          // Create user
          const user = await createTestUser(userId);
          
          // Suspend user
          await suspendUser(userId, reason);
          
          // Verify suspension state
          const suspended = await getUser(userId);
          expect(suspended.isSuspended).toBe(true);
          expect(suspended.suspendedAt).toBeTruthy();
          expect(suspended.suspendedReason).toBe(reason);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Testing Tools

- **Unit Testing**: Vitest (already in use)
- **Property Testing**: fast-check (JavaScript/TypeScript PBT library)
- **E2E Testing**: Playwright (for critical admin workflows)
- **API Testing**: Supertest or built-in Next.js testing utilities
- **Database Testing**: In-memory PostgreSQL or test database

### Test Data Management

- Use factories for generating test data
- Clean up test data after each test
- Use transactions for database tests (rollback after test)
- Mock external services (Paystack, email)
- Use fixed timestamps for time-dependent tests

### Coverage Goals

- Unit test coverage: >80% for business logic
- Property test coverage: 100% of defined properties
- E2E test coverage: All critical admin workflows
- API endpoint coverage: 100% of admin endpoints

### Continuous Integration

- Run unit tests on every commit
- Run property tests on every PR
- Run E2E tests before deployment
- Generate coverage reports
- Fail build if coverage drops below threshold

## Security Considerations

### Authentication and Authorization

1. **Session Management**
   - Use secure, HTTP-only cookies for session tokens
   - Implement session timeout (30 minutes of inactivity)
   - Refresh tokens on activity
   - Invalidate sessions on logout
   - Store sessions in database for multi-instance support

2. **Role-Based Access Control**
   - Check role on every admin request (middleware)
   - Verify permissions at API handler level (defense in depth)
   - Log all permission denials
   - Never trust client-side role checks

3. **Password Security**
   - Use bcrypt with cost factor 10
   - Never log or display password hashes
   - Require strong passwords (min 8 chars, mixed case, numbers)
   - Implement password reset with time-limited tokens

### Input Validation and Sanitization

1. **Server-Side Validation**
   - Validate all inputs on server (never trust client)
   - Use Zod schemas for type-safe validation
   - Reject invalid inputs with 400 status
   - Sanitize inputs to prevent injection attacks

2. **SQL Injection Prevention**
   - Use Drizzle ORM parameterized queries (never string concatenation)
   - Validate and sanitize all user inputs
   - Use prepared statements for all database operations

3. **XSS Prevention**
   - Sanitize all user-generated content before display
   - Use React's built-in XSS protection (JSX escaping)
   - Set Content-Security-Policy headers
   - Never use dangerouslySetInnerHTML with user content

4. **CSRF Protection**
   - Include CSRF tokens in all state-changing operations
   - Validate CSRF tokens on server
   - Use SameSite cookie attribute
   - Verify Origin/Referer headers

### Rate Limiting

1. **Admin Endpoint Rate Limits**
   - 100 requests per minute per admin user
   - 10 CSV exports per hour per admin
   - 5 password reset attempts per hour
   - Track by user ID (authenticated) or IP (unauthenticated)

2. **Rate Limit Implementation**
   - Use existing rate-limit.ts utility
   - Return 429 with Retry-After header
   - Log rate limit violations
   - Consider temporary IP blocks for severe abuse

3. **DDoS Protection**
   - Use Vercel's built-in DDoS protection
   - Implement request throttling at edge
   - Monitor for unusual traffic patterns
   - Have incident response plan

### Data Protection

1. **Sensitive Data Handling**
   - Mask NIDs in all admin interfaces (show only last 4 digits)
   - Never log full NIDs, passwords, or API keys
   - Encrypt sensitive data at rest (database encryption)
   - Use HTTPS for all communications (TLS 1.3)

2. **Data Access Logging**
   - Log all access to sensitive data
   - Include user ID, timestamp, IP address
   - Store logs for minimum 90 days (compliance)
   - Monitor for unusual access patterns

3. **Data Retention**
   - Retain audit logs for 7 years (financial compliance)
   - Implement data deletion on user request (NDPR)
   - Anonymize data after retention period
   - Document data retention policies

### Audit Logging

1. **What to Log**
   - All admin actions (suspend, role change, reconciliation)
   - All authentication events (login, logout, failures)
   - All data access (user details, transactions)
   - All permission denials
   - All errors and exceptions

2. **Log Format**
   - Timestamp (ISO 8601 with timezone)
   - User ID and role
   - Action type and description
   - Target resource (user ID, ticket ID, etc.)
   - IP address and user agent
   - Result (success/failure)
   - Metadata (old/new values for changes)

3. **Log Storage**
   - Store in admin_actions and audit_logs tables
   - Replicate to external logging service (future)
   - Ensure logs are immutable (append-only)
   - Implement log rotation and archival

### Compliance

1. **NDPR/GDPR Compliance**
   - Obtain consent for data processing
   - Provide data access and deletion rights
   - Implement data portability (CSV export)
   - Document data processing activities
   - Appoint data protection officer

2. **Financial Regulations**
   - Maintain audit trail for all transactions
   - Implement transaction reconciliation
   - Store financial records for 7 years
   - Ensure data integrity and non-repudiation

3. **Security Standards**
   - Follow OWASP Top 10 guidelines
   - Implement security headers (CSP, HSTS, X-Frame-Options)
   - Regular security audits and penetration testing
   - Vulnerability scanning and patching

### Incident Response

1. **Security Incident Plan**
   - Detect: Monitor logs for suspicious activity
   - Respond: Isolate affected systems, revoke compromised credentials
   - Recover: Restore from backups, patch vulnerabilities
   - Learn: Post-mortem analysis, update procedures

2. **Breach Notification**
   - Notify affected users within 72 hours
   - Report to regulatory authorities (NITDA)
   - Document incident details and response
   - Implement preventive measures

## Performance Optimizations

### Database Query Optimization

1. **Indexing Strategy**
   - Existing indexes on frequently queried fields (see schema)
   - Composite indexes for common filter combinations
   - Monitor slow queries and add indexes as needed
   - Regular ANALYZE and VACUUM operations

2. **Query Patterns**
   - Use pagination for all list queries (LIMIT/OFFSET)
   - Implement cursor-based pagination for large datasets
   - Use SELECT only needed columns (avoid SELECT *)
   - Batch related queries with joins

3. **Connection Pooling**
   - Use Drizzle's connection pooling
   - Configure pool size based on load (start with 10)
   - Monitor connection usage and adjust
   - Implement connection timeout and retry logic

### Caching Strategy

1. **Dashboard Metrics Cache**
   - Cache for 60 seconds (in-memory or Redis)
   - Invalidate on relevant data changes
   - Use stale-while-revalidate pattern
   - Cache key includes date range and filters

2. **User List Cache**
   - Cache search results for 30 seconds
   - Invalidate on user updates
   - Cache key includes search params and page

3. **Static Data Cache**
   - Cache admin list (for ticket assignment) for 5 minutes
   - Cache system health status for 30 seconds
   - Use Next.js built-in caching for static pages

### API Response Optimization

1. **Response Size Reduction**
   - Paginate all list responses
   - Return only necessary fields
   - Compress responses (gzip/brotli)
   - Use HTTP/2 for multiplexing

2. **Parallel Data Fetching**
   - Fetch independent data in parallel (Promise.all)
   - Use React Server Components for automatic parallelization
   - Avoid waterfall requests

3. **Lazy Loading**
   - Load charts and heavy components on demand
   - Implement infinite scroll for long lists
   - Defer non-critical data fetching

### Frontend Performance

1. **Code Splitting**
   - Split admin routes into separate bundles
   - Lazy load chart libraries (recharts)
   - Use dynamic imports for heavy components

2. **Asset Optimization**
   - Optimize images (WebP format, responsive sizes)
   - Minimize CSS and JavaScript
   - Use CDN for static assets (Vercel Edge Network)

3. **Rendering Optimization**
   - Use React Server Components for data fetching
   - Implement virtualization for long lists (react-window)
   - Memoize expensive calculations
   - Debounce search inputs (300ms)

### Monitoring and Alerting

1. **Performance Metrics**
   - Track API response times (p50, p95, p99)
   - Monitor database query times
   - Measure page load times (Core Web Vitals)
   - Track error rates

2. **Alerting Thresholds**
   - Alert if API response time > 1000ms (p95)
   - Alert if error rate > 1%
   - Alert if database connections > 80% of pool
   - Alert if webhook delivery rate < 95%

3. **Monitoring Tools**
   - Use Vercel Analytics for frontend metrics
   - Implement custom logging for backend metrics
   - Consider APM tools (Sentry, DataDog) for production
   - Set up uptime monitoring (Pingdom, UptimeRobot)

## Implementation Notes

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Charts**: Recharts
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query for server state
- **Testing**: Vitest (unit), fast-check (property), Playwright (E2E)
- **Email**: Resend or similar service
- **Deployment**: Vercel

### Dependencies to Add

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

### File Structure

```
app/
├── admin/
│   ├── layout.tsx                 # Admin layout with sidebar
│   ├── page.tsx                   # Dashboard (analytics)
│   ├── users/
│   │   ├── page.tsx              # User list
│   │   └── [id]/
│   │       └── page.tsx          # User detail
│   ├── tickets/
│   │   ├── page.tsx              # Ticket list
│   │   └── [id]/
│   │       └── page.tsx          # Ticket detail
│   ├── transactions/
│   │   ├── page.tsx              # Transaction list
│   │   └── [id]/
│   │       └── page.tsx          # Transaction detail
│   ├── analytics/
│   │   └── page.tsx              # Advanced analytics
│   ├── system/
│   │   └── page.tsx              # System health
│   └── actions/
│       └── page.tsx              # Admin actions log (super_admin)
├── api/
│   ├── admin/
│   │   ├── users/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET detail, PATCH update
│   │   │       ├── suspend/route.ts
│   │   │       ├── activate/route.ts
│   │   │       └── role/route.ts
│   │   ├── tickets/
│   │   │   ├── route.ts          # GET list
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET detail, PATCH update
│   │   │       ├── messages/route.ts
│   │   │       ├── assign/route.ts
│   │   │       └── reconcile/route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts          # GET list
│   │   │   ├── [id]/route.ts    # GET detail
│   │   │   └── export/route.ts  # POST export CSV
│   │   ├── analytics/
│   │   │   ├── overview/route.ts
│   │   │   ├── revenue/route.ts
│   │   │   └── users/route.ts
│   │   ├── system/
│   │   │   ├── health/route.ts
│   │   │   └── errors/route.ts
│   │   ├── actions/
│   │   │   └── route.ts          # GET admin actions log
│   │   └── reconcile-payment/
│   │       └── route.ts          # Existing endpoint
│   └── tickets/
│       └── route.ts              # User ticket endpoints
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   └── admin-breadcrumb.tsx
│   │   ├── dashboard/
│   │   │   ├── metric-card.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── user-growth-chart.tsx
│   │   │   └── activity-feed.tsx
│   │   ├── users/
│   │   │   ├── user-table.tsx
│   │   │   ├── user-filters.tsx
│   │   │   ├── user-detail-modal.tsx
│   │   │   └── suspend-user-dialog.tsx
│   │   ├── tickets/
│   │   │   ├── ticket-list.tsx
│   │   │   ├── ticket-card.tsx
│   │   │   ├── ticket-filters.tsx
│   │   │   ├── conversation-thread.tsx
│   │   │   ├── message-input.tsx
│   │   │   └── reconcile-payment-button.tsx
│   │   ├── transactions/
│   │   │   ├── transaction-table.tsx
│   │   │   ├── transaction-filters.tsx
│   │   │   └── transaction-summary.tsx
│   │   ├── analytics/
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── revenue-trend-chart.tsx
│   │   │   └── metrics-table.tsx
│   │   ├── system/
│   │   │   ├── health-status-card.tsx
│   │   │   ├── response-time-chart.tsx
│   │   │   └── error-log.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx
│   │       ├── priority-badge.tsx
│   │       ├── action-menu.tsx
│   │       └── data-table.tsx
│   └── ui/
│       └── ... (existing shadcn/ui components)
├── lib/
│   ├── admin/
│   │   ├── services.ts           # Admin business logic
│   │   ├── queries.ts            # Database queries
│   │   ├── analytics.ts          # Analytics calculations
│   │   └── export.ts             # CSV export utilities
│   ├── auth.ts                   # Existing auth utilities
│   ├── audit-log.ts              # Existing audit logging
│   ├── rate-limit.ts             # Existing rate limiting
│   └── email.ts                  # Email service (to be created)
└── middleware.ts                 # Add admin route protection
```

### Migration Plan

1. **Phase 1: Foundation** (Week 1)
   - Run database migration (0002_add_admin_system.sql)
   - Update middleware for admin route protection
   - Create admin layout and navigation
   - Set up admin authentication checks

2. **Phase 2: User Management** (Week 2)
   - Implement user list page with search/filters
   - Create user detail modal
   - Add suspend/activate functionality
   - Implement role management (super_admin)

3. **Phase 3: Support Tickets** (Week 3)
   - Create ticket submission form (user side)
   - Implement ticket list page (admin side)
   - Build ticket detail page with messaging
   - Integrate payment reconciliation

4. **Phase 4: Analytics Dashboard** (Week 4)
   - Implement metrics calculations
   - Create dashboard with charts
   - Add date range filters
   - Implement CSV export

5. **Phase 5: Transactions & System Health** (Week 5)
   - Build transaction management pages
   - Create system health dashboard
   - Implement admin actions log
   - Add monitoring and alerting

6. **Phase 6: Testing & Polish** (Week 6)
   - Write unit tests
   - Implement property-based tests
   - Conduct E2E testing
   - Performance optimization
   - Security audit

### Environment Variables

Add to `.env`:

```bash
# Admin System
ADMIN_SECRET_KEY=your-secret-key-here  # For initial admin authentication
FIRST_SUPER_ADMIN_EMAIL=admin@verifynin.ng

# Email Service (Resend or similar)
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@verifynin.ng

# Rate Limiting (optional, for Redis)
REDIS_URL=redis://localhost:6379

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### Initial Super Admin Setup

After running the migration, create the first super admin:

```sql
INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at)
VALUES (
  'admin_' || gen_random_uuid()::text,
  'System Administrator',
  'admin@verifynin.ng',
  '+2340000000000',
  '$2a$10$...',  -- Hash of initial password
  'super_admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

Or use a setup script:

```typescript
// scripts/create-super-admin.ts
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { hash } from 'bcryptjs';
import { nanoid } from 'nanoid';

const email = process.env.FIRST_SUPER_ADMIN_EMAIL || 'admin@verifynin.ng';
const password = process.env.FIRST_SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

const passwordHash = await hash(password, 10);

await db.insert(users).values({
  id: `admin_${nanoid()}`,
  fullName: 'System Administrator',
  email,
  phone: '+2340000000000',
  passwordHash,
  role: 'super_admin',
  createdAt: new Date()
}).onConflictDoNothing();

console.log(`Super admin created: ${email}`);
```

---

**Design Document Version**: 1.0  
**Last Updated**: 2026-03-06  
**Status**: Ready for Implementation
