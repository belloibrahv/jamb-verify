# Admin System Setup Scripts

This directory contains scripts for setting up and managing the admin system for VerifyNIN.

## Scripts

### 1. Run Admin System Migration

Executes the database migration to create admin system tables and fields.

```bash
npm run db:migrate-admin
```

**What it does:**
- Creates `support_tickets` table for user support tickets
- Creates `ticket_messages` table for ticket conversations
- Creates `admin_actions` table for audit logging
- Adds `role`, `is_suspended`, `suspended_at`, `suspended_reason` fields to `users` table
- Adds `purpose` field to `nin_verifications` table
- Creates necessary indexes for performance
- Creates triggers for automatic timestamp updates

**Note:** This script is idempotent - it can be run multiple times safely. Existing objects will be skipped.

### 2. Create Super Admin User

Creates the first super admin user for the system.

```bash
npm run admin:create
```

**What it does:**
- Creates a new user with `super_admin` role
- Uses credentials from environment variables:
  - `FIRST_SUPER_ADMIN_EMAIL`
  - `FIRST_SUPER_ADMIN_PASSWORD`
- If user already exists, updates their role to `super_admin`

**Important:** Change the default password after first login!

### 3. Test Database Schema

Tests that all admin system tables and fields are accessible.

```bash
npm run admin:test-schema
```

**What it does:**
- Verifies all admin system tables exist and are accessible
- Checks that the super admin user was created
- Displays a summary of database state
- Confirms the schema is ready for use

## Setup Instructions

### First Time Setup

1. **Configure Environment Variables**

   Add these variables to your `.env` file:

   ```bash
   # Admin System
   ADMIN_SECRET_KEY="your-admin-secret-key-for-reconciliation"
   FIRST_SUPER_ADMIN_EMAIL="admin@verifynin.ng"
   FIRST_SUPER_ADMIN_PASSWORD="ChangeMe123!"
   
   # Email Service
   EMAIL_API_KEY="your-email-api-key"
   EMAIL_FROM="noreply@verifynin.ng"
   ```

2. **Run the Migration**

   ```bash
   npm run db:migrate-admin
   ```

3. **Create Super Admin**

   ```bash
   npm run admin:create
   ```

4. **Test the Setup**

   ```bash
   npm run admin:test-schema
   ```

### Updating Existing Database

If you already have a database and need to add admin system features:

1. Run the migration (existing objects will be skipped):
   ```bash
   npm run db:migrate-admin
   ```

2. Create or update super admin:
   ```bash
   npm run admin:create
   ```

## Environment Variables

### Required for Admin System

- `ADMIN_SECRET_KEY` - Secret key for admin operations and payment reconciliation
- `FIRST_SUPER_ADMIN_EMAIL` - Email address for the first super admin user
- `FIRST_SUPER_ADMIN_PASSWORD` - Password for the first super admin user (change after first login!)

### Required for Email Notifications

- `EMAIL_API_KEY` - API key for email service (e.g., Resend, SendGrid)
- `EMAIL_FROM` - Sender email address for notifications

## Troubleshooting

### Migration Fails

If the migration fails:

1. Check that `DATABASE_URL` is set correctly in `.env`
2. Verify database connection is working
3. Check error message for specific issues
4. If objects already exist, this is normal - the script will skip them

### Super Admin Creation Fails

If super admin creation fails:

1. Verify `FIRST_SUPER_ADMIN_EMAIL` and `FIRST_SUPER_ADMIN_PASSWORD` are set
2. Check that the migration ran successfully first
3. If user already exists, the script will update their role instead

### Schema Test Fails

If schema test fails:

1. Run the migration first: `npm run db:migrate-admin`
2. Check database connection
3. Verify all tables were created successfully

## Security Notes

- **Change default password:** Always change the default super admin password after first login
- **Secure credentials:** Never commit `.env` file with real credentials
- **Admin secret key:** Generate a strong random key using `openssl rand -base64 32`
- **Email API key:** Keep email service API keys secure and rotate regularly

## Next Steps

After running these scripts:

1. Log in with super admin credentials
2. Change the default password
3. Create additional admin users as needed
4. Configure email service for notifications
5. Test admin features (user management, tickets, etc.)

## Support

For issues or questions about these scripts, refer to:
- Main documentation: `docs/ADMIN_SYSTEM_DESIGN.md`
- Implementation plan: `.kiro/specs/admin-system-implementation/tasks.md`
- Requirements: `.kiro/specs/admin-system-implementation/requirements.md`
