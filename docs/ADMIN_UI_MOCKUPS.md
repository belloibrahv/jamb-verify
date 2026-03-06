# Admin Dashboard UI Mockups

## Color Palette

```
Primary (Admin):   #2563eb (Blue)
Success:           #16a34a (Green)
Warning:           #f59e0b (Amber)
Danger:            #dc2626 (Red)
Info:              #06b6d4 (Cyan)
Background:        #f8fafc (Light Gray)
Card:              #ffffff (White)
Border:            #e2e8f0 (Gray)
Text Primary:      #0f172a (Dark)
Text Secondary:    #64748b (Gray)
```

---

## 1. Admin Dashboard (Home)

```
┌────────────────────────────────────────────────────────────────┐
│  🏠 JAMB Verify Admin                    👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📊 Overview - March 2026                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 👥 Users │  │ 💰 Revenue│  │ ✅ Success│  │ 🎫 Tickets│     │
│  │  1,234   │  │ ₦2.5M    │  │  98.5%   │  │    12     │     │
│  │  +12%    │  │  +23%    │  │  +2.1%   │  │   -3      │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📈 User Growth (Last 30 Days)                          │  │
│  │                                                          │  │
│  │      ╱╲                                                  │  │
│  │     ╱  ╲      ╱╲                                        │  │
│  │    ╱    ╲    ╱  ╲    ╱╲                                │  │
│  │   ╱      ╲  ╱    ╲  ╱  ╲                               │  │
│  │  ╱        ╲╱      ╲╱    ╲                              │  │
│  │ ─────────────────────────────────────                   │  │
│  │  Week 1  Week 2  Week 3  Week 4                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────────┐  │
│  │ 🔔 Recent Activity     │  │ ⚠️  Pending Actions        │  │
│  │                        │  │                             │  │
│  │ • New user registered  │  │ • 3 tickets need response  │  │
│  │ • Payment reconciled   │  │ • 2 failed webhooks        │  │
│  │ • Ticket resolved      │  │ • 1 suspended user         │  │
│  │ • Verification success │  │                             │  │
│  └────────────────────────┘  └────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. User Management Page

```
┌────────────────────────────────────────────────────────────────┐
│  👥 User Management                      👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  🔍 [Search users...]  [Filter ▼]  [Export CSV]        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Name          Email              Balance    Status  ⚙️   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ John Doe      john@email.com    ₦1,500    ✅ Active  •••│  │
│  │ Jane Smith    jane@email.com    ₦500      ✅ Active  •••│  │
│  │ Bob Wilson    bob@email.com     ₦0        🔴 Suspended•••│  │
│  │ Alice Brown   alice@email.com   ₦2,000    ✅ Active  •••│  │
│  │ ...                                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ← Previous  [1] 2 3 4 5 ... 20  Next →                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

When clicking ••• (Actions):
┌──────────────────────┐
│ 👁️  View Details     │
│ 💳 View Transactions │
│ 📄 View Verifications│
│ ⏸️  Suspend User     │
│ 🔄 Reset Password    │
│ 📧 Send Email        │
└──────────────────────┘
```

---

## 3. Support Tickets Page

```
┌────────────────────────────────────────────────────────────────┐
│  🎫 Support Tickets                      👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [All] [Open: 12] [In Progress: 5] [Resolved: 234]     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🔴 #T-1234 - Payment not showing in wallet              │  │
│  │    john@email.com • 2 hours ago • Urgent                │  │
│  │    💰 Payment Issue • ₦1,000 • Ref: T_abc123           │  │
│  │    [View Details] [Reconcile Payment]                   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 🟡 #T-1233 - Cannot verify NIN                          │  │
│  │    jane@email.com • 5 hours ago • High                  │  │
│  │    🔍 Verification Issue                                │  │
│  │    [View Details] [Assign to Me]                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 🟢 #T-1232 - How to download receipt                    │  │
│  │    bob@email.com • 1 day ago • Low                      │  │
│  │    ❓ General Question • Resolved                       │  │
│  │    [View Details]                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Ticket Detail Page

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back to Tickets                       👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐│
│  │ 🎫 Ticket #T-1234               │  │ 👤 User Info         ││
│  │                                 │  │                      ││
│  │ Status: [Open ▼]                │  │ John Doe             ││
│  │ Priority: 🔴 Urgent             │  │ john@email.com       ││
│  │ Type: Payment Issue             │  │ +234 123 456 7890    ││
│  │ Assigned: [Select Admin ▼]     │  │                      ││
│  │                                 │  │ Wallet: ₦500         ││
│  │ ─────────────────────────────── │  │ Joined: Jan 2026     ││
│  │                                 │  │ Verifications: 3     ││
│  │ 💬 Conversation                 │  │                      ││
│  │                                 │  │ [View Full Profile]  ││
│  │ ┌─────────────────────────────┐ │  └──────────────────────┘│
│  │ │ 👤 John (User) - 2h ago     │ │                          │
│  │ │ I paid ₦1,000 but it's not  │ │  ┌──────────────────────┐│
│  │ │ showing in my wallet.       │ │  │ 💰 Payment Details   ││
│  │ │ Reference: T_abc123xyz      │ │  │                      ││
│  │ └─────────────────────────────┘ │  │ Ref: T_abc123xyz     ││
│  │                                 │  │ Amount: ₦1,000       ││
│  │ ┌─────────────────────────────┐ │  │ Status: ✅ Success   ││
│  │ │ 👨‍💼 Admin (You) - 1h ago     │ │  │ Date: Mar 6, 2026    ││
│  │ │ I'm looking into this now.  │ │  │                      ││
│  │ │ Checking Paystack...        │ │  │ [Reconcile Payment]  ││
│  │ └─────────────────────────────┘ │  │ [View on Paystack]   ││
│  │                                 │  └──────────────────────┘│
│  │ ┌─────────────────────────────┐ │                          │
│  │ │ [Type your message...]      │ │  ┌──────────────────────┐│
│  │ │                             │ │  │ 📝 Internal Notes    ││
│  │ │ [Send Message]              │ │  │                      ││
│  │ └─────────────────────────────┘ │  │ (Only visible to     ││
│  │                                 │  │  admins)             ││
│  │ ─────────────────────────────── │  │                      ││
│  │                                 │  │ [Add Note...]        ││
│  │ [Mark as Resolved]              │  └──────────────────────┘│
│  │ [Close Ticket]                  │                          │
│  └─────────────────────────────────┘                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Analytics Page

```
┌────────────────────────────────────────────────────────────────┐
│  📊 Analytics                            👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📅 [Last 7 Days ▼]  [Last 30 Days]  [Custom Range]    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │ 💰 Revenue Trend         │  │ 👥 User Growth           │  │
│  │                          │  │                          │  │
│  │  ₦3M │                   │  │ 2000│                    │  │
│  │      │     ╱╲            │  │     │        ╱╲          │  │
│  │  ₦2M │    ╱  ╲           │  │ 1500│       ╱  ╲         │  │
│  │      │   ╱    ╲          │  │     │      ╱    ╲        │  │
│  │  ₦1M │  ╱      ╲         │  │ 1000│     ╱      ╲       │  │
│  │      │ ╱        ╲        │  │     │    ╱        ╲      │  │
│  │    0 └──────────────     │  │   0 └──────────────      │  │
│  │      Jan Feb Mar Apr     │  │     Jan Feb Mar Apr      │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │ ✅ Verification Success  │  │ 🎯 Top Metrics           │  │
│  │                          │  │                          │  │
│  │     Success: 98.5%       │  │ • Avg. Transaction: ₦850│  │
│  │     ████████████░░       │  │ • Daily Active: 234     │  │
│  │                          │  │ • Conversion: 45%       │  │
│  │     Failed: 1.5%         │  │ • Retention: 78%        │  │
│  │     ░                    │  │ • ARPU: ₦1,250          │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📈 Detailed Metrics Table                               │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Date       Users  Revenue  Verifications  Success Rate  │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Mar 6      45     ₦22,500  42            97.6%          │  │
│  │ Mar 5      52     ₦26,000  50            98.0%          │  │
│  │ Mar 4      38     ₦19,000  36            94.7%          │  │
│  │ ...                                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Export to CSV] [Export to PDF] [Schedule Report]            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Transaction Management

```
┌────────────────────────────────────────────────────────────────┐
│  💳 Transactions                         👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  🔍 [Search...]  [Type ▼]  [Status ▼]  [Date ▼]        │  │
│  │  [Export CSV] [Export Excel]                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Date/Time    User         Type      Amount    Status    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Mar 6, 14:30 john@...     Credit    ₦1,000   ✅ Complete│  │
│  │ Mar 6, 14:25 jane@...     Debit     ₦500     ✅ Complete│  │
│  │ Mar 6, 14:20 bob@...      Credit    ₦2,000   ⏳ Pending │  │
│  │ Mar 6, 14:15 alice@...    Debit     ₦500     ✅ Complete│  │
│  │ Mar 6, 14:10 john@...     Refund    ₦500     ✅ Complete│  │
│  │ ...                                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📊 Summary                                              │  │
│  │ Total Transactions: 1,234                               │  │
│  │ Total Volume: ₦1,234,500                                │  │
│  │ Success Rate: 98.5%                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. System Health Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│  ⚙️  System Health                       👤 Admin Name  [Logout]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 🟢 API   │  │ 🟢 DB    │  │ 🟡 Webhook│  │ 🟢 Paystack│     │
│  │  Healthy │  │  Healthy │  │  Warning │  │  Healthy  │     │
│  │  99.9%   │  │  100%    │  │  95.2%   │  │  99.8%    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📊 API Response Times (Last Hour)                       │  │
│  │                                                          │  │
│  │ 500ms│                                                   │  │
│  │      │     ╱╲                                           │  │
│  │ 400ms│    ╱  ╲                                          │  │
│  │      │   ╱    ╲    ╱╲                                   │  │
│  │ 300ms│  ╱      ╲  ╱  ╲                                  │  │
│  │      │ ╱        ╲╱    ╲                                 │  │
│  │ 200ms└──────────────────                                │  │
│  │      14:00  14:15  14:30  14:45  15:00                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────────┐  │
│  │ 🚨 Recent Errors       │  │ 📡 Webhook Status          ││
│  │                        │  │                             ││
│  │ • Database timeout     │  │ Delivered: 1,234 (98%)     ││
│  │   (2 occurrences)      │  │ Failed: 25 (2%)            ││
│  │                        │  │ Pending Retry: 5           ││
│  │ • Paystack API 500     │  │                             ││
│  │   (1 occurrence)       │  │ Last Success: 2 min ago    ││
│  │                        │  │ Last Failure: 1 hour ago   ││
│  │ [View All Errors]      │  │                             ││
│  └────────────────────────┘  │ [View Failed Webhooks]     ││
│                               └────────────────────────────┘│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Design

### Mobile Dashboard (< 768px)

```
┌──────────────────────┐
│ ☰  JAMB Admin   👤   │
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │
│ │ 👥 Users         │ │
│ │ 1,234  +12%      │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 💰 Revenue       │ │
│ │ ₦2.5M  +23%      │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ ✅ Success       │ │
│ │ 98.5%  +2.1%     │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 🎫 Tickets       │ │
│ │ 12  -3           │ │
│ └──────────────────┘ │
│                      │
│ [View Full Report]   │
│                      │
└──────────────────────┘
```

---

## Component Library

### Metric Card
```tsx
<MetricCard
  icon={<Users />}
  title="Total Users"
  value="1,234"
  change="+12%"
  trend="up"
  color="blue"
/>
```

### Status Badge
```tsx
<StatusBadge status="active" />    // Green
<StatusBadge status="suspended" /> // Red
<StatusBadge status="pending" />   // Yellow
```

### Priority Badge
```tsx
<PriorityBadge priority="urgent" />  // Red
<PriorityBadge priority="high" />    // Orange
<PriorityBadge priority="medium" />  // Yellow
<PriorityBadge priority="low" />     // Green
```

### Action Menu
```tsx
<ActionMenu>
  <ActionMenuItem icon={<Eye />}>View Details</ActionMenuItem>
  <ActionMenuItem icon={<Edit />}>Edit</ActionMenuItem>
  <ActionMenuItem icon={<Trash />} danger>Delete</ActionMenuItem>
</ActionMenu>
```

---

**Design System:** Based on shadcn/ui + Tailwind CSS
**Icons:** Lucide React (already in use)
**Charts:** Recharts
**Tables:** TanStack Table

