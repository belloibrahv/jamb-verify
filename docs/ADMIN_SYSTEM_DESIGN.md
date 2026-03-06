# Admin System Design & Implementation Plan

## Overview

A comprehensive admin dashboard system for managing users, monitoring metrics, and resolving payment issues.

---

## 🏗️ System Architecture

### Database Schema Changes

#### 1. Add Role to Users Table
```sql
-- Add role enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Add role column to users table
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';

-- Create index for faster role queries
CREATE INDEX idx_users_role ON users(role);
```

#### 2. Support Tickets Table
```sql
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'payment_issue', 'verification_issue', 'general'
  status TEXT NOT NULL, -- 'open', 'in_progress', 'resolved', 'closed'
  priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'urgent'
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_reference TEXT,
  assigned_to TEXT REFERENCES users(id), -- admin user
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
```

#### 3. Ticket Messages Table
```sql
CREATE TABLE ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
```

#### 4. Admin Actions Log
```sql
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL, -- 'user_suspended', 'payment_reconciled', 'ticket_resolved'
  target_user_id TEXT REFERENCES users(id),
  target_resource TEXT, -- ticket_id, transaction_id, etc.
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
```

---

## 📊 Admin Dashboard Pages

### 1. `/admin` - Main Dashboard (Analytics)

**Metrics Cards:**
- Total Users
- Active Users (last 30 days)
- Total Revenue (this month)
- Pending Tickets
- Success Rate (verifications)
- Average Transaction Value

**Charts:**
- User Registration Trend (line chart)
- Revenue Over Time (bar chart)
- Verification Success/Failure (pie chart)
- Daily Active Users (area chart)

**Recent Activity:**
- Latest registrations
- Recent verifications
- Recent payments
- Recent tickets

### 2. `/admin/users` - User Management

**Features:**
- Paginated user table
- Search by email, name, phone
- Filter by role, status, registration date
- Sort by various fields
- Actions per user:
  - View details
  - View transactions
  - View verifications
  - Suspend/Activate
  - Reset password
  - Send notification

**User Detail Modal:**
- Personal info
- Wallet balance
- Transaction history
- Verification history
- Activity logs
- Support tickets

### 3. `/admin/tickets` - Support Tickets

**Ticket List:**
- Filter by status, priority, type
- Search by ticket ID, user email
- Sort by date, priority
- Color-coded by priority
- Quick actions (assign, resolve)

**Ticket Detail Page:**
- Full conversation thread
- User information sidebar
- Payment details (if payment issue)
- Quick reconciliation button
- Status change dropdown
- Internal notes section
- Assign to admin dropdown

### 4. `/admin/transactions` - Transaction Management

**Features:**
- All wallet transactions
- All NIN verifications
- Filter by date range, status, type
- Search by reference, user email
- Export to CSV
- Bulk actions
- Refund management

**Transaction Details:**
- Full transaction info
- User details
- Payment provider data
- Audit trail
- Related tickets
- Reconciliation status

### 5. `/admin/analytics` - Advanced Analytics

**Metrics:**
- Revenue analytics (daily, weekly, monthly)
- User growth rate
- Churn rate
- Average revenue per user (ARPU)
- Customer lifetime value (CLV)
- Verification success rate by time
- Payment success rate
- Webhook delivery rate

**Charts:**
- Cohort analysis
- Funnel analysis (registration → verification)
- Geographic distribution
- Peak usage times
- Revenue forecasting

### 6. `/admin/system` - System Health

**Monitoring:**
- API response times
- Error rates
- Webhook delivery status
- Database performance
- YouVerify API status
- Paystack API status
- Recent errors log

**Configuration:**
- Feature flags
- Rate limits
- Maintenance mode
- System announcements

---

## 🔐 Security & Access Control

### Role-Based Access Control (RBAC)

**User Roles:**
1. **user** - Regular users
   - Access own dashboard
   - Submit support tickets
   - View own data

2. **admin** - Support staff
   - View all users
   - Manage support tickets
   - Reconcile payments
   - View analytics
   - Cannot delete users
   - Cannot change system settings

3. **super_admin** - System administrators
   - All admin permissions
   - User role management
   - System configuration
   - Delete users
   - Access admin action logs

### Middleware Protection

```typescript
// middleware.ts - Add admin route protection
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin routes
  if (pathname.startsWith('/admin')) {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user is admin
    if (session.role !== 'admin' && session.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // ... rest of middleware
}
```

---

## 🎨 UI/UX Design

### Admin Layout

```
┌─────────────────────────────────────────────────┐
│  [Logo] JAMB Verify Admin    [User] [Logout]   │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │         Main Content Area            │
│          │                                       │
│ • Home   │  ┌─────────────────────────────┐    │
│ • Users  │  │  Metrics Cards              │    │
│ • Tickets│  └─────────────────────────────┘    │
│ • Trans. │                                       │
│ • Analyt.│  ┌─────────────────────────────┐    │
│ • System │  │  Charts & Graphs            │    │
│          │  └─────────────────────────────┘    │
│          │                                       │
│          │  ┌─────────────────────────────┐    │
│          │  │  Recent Activity            │    │
│          │  └─────────────────────────────┘    │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

### Design System

**Colors:**
- Primary: Blue (#2563eb) - Admin actions
- Success: Green (#16a34a) - Resolved tickets
- Warning: Amber (#f59e0b) - Pending items
- Danger: Red (#dc2626) - Critical issues
- Info: Cyan (#06b6d4) - Information

**Components:**
- Data tables with sorting, filtering, pagination
- Modal dialogs for quick actions
- Toast notifications for feedback
- Loading skeletons
- Empty states
- Error boundaries

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Database schema updates
- [ ] Add role field to users
- [ ] Create support tickets tables
- [ ] Admin middleware protection
- [ ] Basic admin layout
- [ ] Admin authentication

### Phase 2: User Management (Week 2)
- [ ] User list page with pagination
- [ ] User search and filters
- [ ] User detail modal
- [ ] Suspend/activate users
- [ ] View user transactions
- [ ] View user verifications

### Phase 3: Support Tickets (Week 3)
- [ ] Ticket submission form (user side)
- [ ] Ticket list page (admin side)
- [ ] Ticket detail page
- [ ] Ticket messaging system
- [ ] Payment reconciliation integration
- [ ] Email notifications

### Phase 4: Analytics Dashboard (Week 4)
- [ ] Metrics calculation queries
- [ ] Dashboard cards
- [ ] Chart components (using recharts)
- [ ] Real-time updates
- [ ] Export functionality
- [ ] Date range filters

### Phase 5: Transaction Management (Week 5)
- [ ] Transaction list page
- [ ] Advanced filters
- [ ] Transaction details
- [ ] Refund functionality
- [ ] CSV export
- [ ] Bulk actions

### Phase 6: System Monitoring (Week 6)
- [ ] System health dashboard
- [ ] Error logging
- [ ] API monitoring
- [ ] Webhook status
- [ ] Performance metrics
- [ ] Alerts system

---

## 📦 Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui (already using)
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table (React Table v8)
- **Forms:** React Hook Form + Zod
- **State:** React Query for server state

### Backend
- **API Routes:** Next.js API routes
- **Database:** PostgreSQL + Drizzle ORM
- **Caching:** Redis (optional, for metrics)
- **Queue:** BullMQ (optional, for background jobs)

### Additional Libraries
```json
{
  "recharts": "^2.10.0",
  "@tanstack/react-table": "^8.11.0",
  "@tanstack/react-query": "^5.17.0",
  "date-fns": "^3.0.0",
  "react-hot-toast": "^2.4.1",
  "xlsx": "^0.18.5"
}
```

---

## 🔌 API Endpoints

### Admin User Management
- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/[id]` - Get user details
- `PATCH /api/admin/users/[id]` - Update user (suspend, role change)
- `GET /api/admin/users/[id]/transactions` - User transactions
- `GET /api/admin/users/[id]/verifications` - User verifications

### Admin Analytics
- `GET /api/admin/analytics/overview` - Dashboard metrics
- `GET /api/admin/analytics/revenue` - Revenue data
- `GET /api/admin/analytics/users` - User growth data
- `GET /api/admin/analytics/verifications` - Verification stats

### Support Tickets
- `POST /api/tickets` - Create ticket (user)
- `GET /api/tickets` - List user's tickets (user)
- `GET /api/admin/tickets` - List all tickets (admin)
- `GET /api/admin/tickets/[id]` - Get ticket details
- `PATCH /api/admin/tickets/[id]` - Update ticket status
- `POST /api/admin/tickets/[id]/messages` - Add message
- `POST /api/admin/tickets/[id]/reconcile` - Reconcile payment

### Admin Transactions
- `GET /api/admin/transactions` - List all transactions
- `GET /api/admin/transactions/[id]` - Transaction details
- `POST /api/admin/transactions/[id]/refund` - Refund transaction

### System Monitoring
- `GET /api/admin/system/health` - System health status
- `GET /api/admin/system/errors` - Recent errors
- `GET /api/admin/system/webhooks` - Webhook delivery status

---

## 📊 Sample Queries for Analytics

### Total Users
```typescript
const totalUsers = await db.select({ count: sql`count(*)` })
  .from(users);
```

### Active Users (Last 30 Days)
```typescript
const activeUsers = await db.select({ count: sql`count(DISTINCT user_id)` })
  .from(auditLogs)
  .where(sql`timestamp > NOW() - INTERVAL '30 days'`);
```

### Monthly Revenue
```typescript
const monthlyRevenue = await db.select({
  month: sql`DATE_TRUNC('month', created_at)`,
  revenue: sql`SUM(amount)`
})
.from(walletTransactions)
.where(eq(walletTransactions.type, 'credit'))
.groupBy(sql`DATE_TRUNC('month', created_at)`)
.orderBy(sql`DATE_TRUNC('month', created_at) DESC`)
.limit(12);
```

### Verification Success Rate
```typescript
const verificationStats = await db.select({
  status: ninVerifications.status,
  count: sql`count(*)`
})
.from(ninVerifications)
.groupBy(ninVerifications.status);
```

---

## 🎯 Key Features Summary

### For Admins:
✅ Complete user management
✅ Real-time analytics dashboard
✅ Support ticket system
✅ One-click payment reconciliation
✅ Transaction monitoring
✅ System health monitoring
✅ Export capabilities
✅ Role-based access control

### For Users:
✅ Submit support tickets
✅ Track ticket status
✅ Receive email notifications
✅ Self-service payment recovery (already implemented)

---

## 🔄 Integration with Existing Features

### Payment Reconciliation
- Support tickets automatically created for failed payments
- Admin can reconcile directly from ticket
- User notified when issue resolved
- Audit trail maintained

### Audit Logging
- All admin actions logged
- User actions tracked
- System events recorded
- Compliance ready

### Security
- Rate limiting on admin endpoints
- Admin action logging
- Session management
- CSRF protection

---

## 📈 Success Metrics

### User Satisfaction
- Average ticket resolution time < 2 hours
- First response time < 30 minutes
- Ticket resolution rate > 95%

### System Performance
- Dashboard load time < 2 seconds
- API response time < 500ms
- Webhook delivery rate > 99%

### Business Metrics
- Monthly active users growth
- Revenue growth rate
- Customer retention rate
- Average revenue per user

---

## 🚦 Next Steps

1. **Review & Approve Design**
   - Stakeholder review
   - UI/UX feedback
   - Security review

2. **Database Migration**
   - Create migration files
   - Test on staging
   - Deploy to production

3. **Implement Phase 1**
   - Set up admin routes
   - Create admin layout
   - Implement authentication

4. **Iterative Development**
   - Build feature by feature
   - Test thoroughly
   - Deploy incrementally

---

**Estimated Timeline:** 6-8 weeks for full implementation
**Team Size:** 1-2 developers
**Priority:** High (critical for business operations)

---

**Last Updated:** March 6, 2026
**Status:** Design Phase - Ready for Implementation
