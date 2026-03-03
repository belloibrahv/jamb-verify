# Environment Variables Reference

This document explains every environment variable used in your JAMB Verify application and how to configure them.

## Overview

Environment variables are configuration values that change between development, staging, and production environments. They are stored in `.env` files and should never be committed to version control.

## Required Variables

### Database Configuration

#### `DATABASE_URL`

**Purpose**: Connection string for your PostgreSQL database

**Format**: 
```
postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
```

**Example**:
```env
DATABASE_URL="postgresql://neondb_owner:npg_u2KqVie7Jlov@ep-long-voice-aihvy2hx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Where to get it**:
- If using Neon: Go to [neon.tech](https://neon.tech), create a project, and copy the connection string
- If using another provider: Get the connection string from your database provider's dashboard

**Important notes**:
- This is sensitive information. Never share it.
- The connection string includes your database password.
- Use environment variables in production, not hardcoded values.
- The `sslmode=require` ensures encrypted connections.

---

### Authentication

#### `AUTH_SECRET`

**Purpose**: Secret key used to encrypt session tokens and cookies

**Format**: A random 32+ character string

**Example**:
```env
AUTH_SECRET="yQUKeQBn8/J7xCnjeskZLempadYfmjLPv9IO7yEqRn4="
```

**How to generate**:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important notes**:
- This must be a strong random value
- Never use the same value across environments
- If you change this, all existing sessions will be invalidated
- Keep this secret. Never share it.

---

### Paystack Configuration

#### `PAYSTACK_PUBLIC_KEY`

**Purpose**: Public key for Paystack payment processing (used in frontend)

**Format**: Starts with `pk_test_` (staging) or `pk_live_` (production)

**Example (Staging)**:
```env
PAYSTACK_PUBLIC_KEY="pk_test_ec5ed34324eb8df91a9f02c494da3efb9ca01699"
```

**Example (Production)**:
```env
PAYSTACK_PUBLIC_KEY="pk_live_your_actual_live_public_key"
```

**Where to get it**:
1. Log in to [paystack.com/dashboard](https://paystack.com/dashboard)
2. Go to Settings → API Keys & Webhooks
3. Copy the Public Key (test or live)

**Important notes**:
- This key is public and safe to expose in frontend code
- Test keys start with `pk_test_`
- Live keys start with `pk_live_`
- Never use live keys in development

---

#### `PAYSTACK_SECRET_KEY`

**Purpose**: Secret key for Paystack API calls (used in backend only)

**Format**: Starts with `sk_test_` (staging) or `sk_live_` (production)

**Example (Staging)**:
```env
PAYSTACK_SECRET_KEY="sk_test_37780b726b59580bca6a7084a5424622aa7054f7"
```

**Example (Production)**:
```env
PAYSTACK_SECRET_KEY="sk_live_your_actual_live_secret_key"
```

**Where to get it**:
1. Log in to [paystack.com/dashboard](https://paystack.com/dashboard)
2. Go to Settings → API Keys & Webhooks
3. Copy the Secret Key (test or live)

**Important notes**:
- This key is sensitive. Never expose it in frontend code.
- Only use this on the backend (server-side).
- Test keys start with `sk_test_`
- Live keys start with `sk_live_`
- Never commit this to version control

---

### YouVerify Configuration

#### `YOUVERIFY_TOKEN`

**Purpose**: Authentication token for YouVerify NIN verification API

**Format**: A long alphanumeric string

**Example (Sandbox)**:
```env
YOUVERIFY_TOKEN="tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB"
```

**Example (Production)**:
```env
YOUVERIFY_TOKEN="your_production_token_here"
```

**Where to get it**:
1. Log in to [youverify.co/dashboard](https://youverify.co/dashboard)
2. Go to API Keys or Settings
3. Copy the Sandbox Token (for testing) or Production Token (for live)

**Important notes**:
- Sandbox token is free and unlimited
- Production token requires a paid subscription
- This is sensitive information. Never share it.
- Keep separate tokens for sandbox and production

---

#### `YOUVERIFY_BASE_URL`

**Purpose**: Base URL for YouVerify API endpoints

**Format**: HTTPS URL to YouVerify API

**Example (Sandbox)**:
```env
YOUVERIFY_BASE_URL="https://api.sandbox.youverify.co/v2"
```

**Example (Production)**:
```env
YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
```

**Important notes**:
- Sandbox uses `api.sandbox.youverify.co`
- Production uses `api.youverify.co`
- Always use v2 API (not v1)
- Must use HTTPS (not HTTP)

---

## Environment-Specific Configurations

### Development Environment

Use this configuration for local development:

```env
# Database (use local or development database)
DATABASE_URL="postgresql://user:password@localhost:5432/jamb_verify_dev"

# Auth (generate a random secret)
AUTH_SECRET="your_random_secret_here"

# Paystack (use test keys)
PAYSTACK_PUBLIC_KEY="pk_test_ec5ed34324eb8df91a9f02c494da3efb9ca01699"
PAYSTACK_SECRET_KEY="sk_test_37780b726b59580bca6a7084a5424622aa7054f7"

# YouVerify (use sandbox)
YOUVERIFY_TOKEN="tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB"
YOUVERIFY_BASE_URL="https://api.sandbox.youverify.co/v2"
```

### Staging Environment

Use this configuration for testing before production:

```env
# Database (use staging database)
DATABASE_URL="postgresql://user:password@staging-db.example.com/jamb_verify_staging"

# Auth (use a different secret than production)
AUTH_SECRET="your_staging_secret_here"

# Paystack (use test keys)
PAYSTACK_PUBLIC_KEY="pk_test_ec5ed34324eb8df91a9f02c494da3efb9ca01699"
PAYSTACK_SECRET_KEY="sk_test_37780b726b59580bca6a7084a5424622aa7054f7"

# YouVerify (use sandbox)
YOUVERIFY_TOKEN="tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB"
YOUVERIFY_BASE_URL="https://api.sandbox.youverify.co/v2"
```

### Production Environment

Use this configuration for live application:

```env
# Database (use production database)
DATABASE_URL="postgresql://user:password@prod-db.example.com/jamb_verify_prod"

# Auth (use a strong random secret)
AUTH_SECRET="your_production_secret_here"

# Paystack (use live keys)
PAYSTACK_PUBLIC_KEY="pk_live_your_actual_live_public_key"
PAYSTACK_SECRET_KEY="sk_live_your_actual_live_secret_key"

# YouVerify (use production)
YOUVERIFY_TOKEN="your_production_token_here"
YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
```

---

## How to Set Environment Variables

### Local Development

1. Create a `.env.local` file in the project root:
   ```bash
   touch .env.local
   ```

2. Add your variables:
   ```env
   DATABASE_URL="..."
   AUTH_SECRET="..."
   PAYSTACK_PUBLIC_KEY="..."
   PAYSTACK_SECRET_KEY="..."
   YOUVERIFY_TOKEN="..."
   YOUVERIFY_BASE_URL="..."
   ```

3. The application will automatically load these variables

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Click Settings → Environment Variables
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your database connection string
   - Environments: Select which environments (Production, Preview, Development)
4. Repeat for each variable
5. Redeploy your application

### Other Hosting Platforms

Refer to your hosting platform's documentation:
- **Heroku**: Use `heroku config:set KEY=value`
- **AWS**: Use AWS Secrets Manager or Parameter Store
- **Docker**: Use `--env` flag or `.env` file
- **Traditional VPS**: Set in `/etc/environment` or application config

---

## Validation and Testing

### Check if Variables are Loaded

Add this temporary code to verify variables are loaded:

```javascript
// In your API route or server component
console.log("Database configured:", !!process.env.DATABASE_URL);
console.log("Auth secret configured:", !!process.env.AUTH_SECRET);
console.log("Paystack configured:", !!process.env.PAYSTACK_PUBLIC_KEY);
console.log("YouVerify configured:", !!process.env.YOUVERIFY_TOKEN);
```

### Test Paystack Connection

```bash
# Test with curl (replace with your actual secret key)
curl -X POST https://api.paystack.co/transaction/initialize \
  -H "Authorization: Bearer sk_test_37780b726b59580bca6a7084a5424622aa7054f7" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":50000}'
```

### Test YouVerify Connection

```bash
# Test with curl (replace with your actual token)
curl -X POST https://api.sandbox.youverify.co/v2/api/identity/ng/nin \
  -H "token: tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB" \
  -H "Content-Type: application/json" \
  -d '{"id":"11111111111","isSubjectConsent":true}'
```

---

## Common Issues

### "DATABASE_URL is not configured"

**Problem**: Application cannot connect to database

**Solution**:
1. Check that `DATABASE_URL` is set in `.env` or environment
2. Verify the connection string is correct
3. Check that the database server is running
4. Test the connection string with a database client

### "PAYSTACK_SECRET_KEY is not configured"

**Problem**: Payment initialization fails

**Solution**:
1. Check that `PAYSTACK_SECRET_KEY` is set
2. Verify you're using the correct key (test vs live)
3. Check that the key hasn't expired
4. Log in to Paystack dashboard to verify the key

### "YOUVERIFY_TOKEN is not configured"

**Problem**: NIN verification fails

**Solution**:
1. Check that `YOUVERIFY_TOKEN` is set
2. Verify you're using the correct token (sandbox vs production)
3. Check that the token hasn't expired
4. Log in to YouVerify dashboard to verify the token

### Variables work locally but not in production

**Problem**: Environment variables are not set on production server

**Solution**:
1. Verify variables are set in your hosting platform
2. Redeploy your application after setting variables
3. Check that variable names match exactly (case-sensitive)
4. Verify that the correct environment is selected (Production vs Preview)

---

## Security Best Practices

1. **Never commit `.env` files to version control**
   - Your `.gitignore` already excludes `.env` files
   - Always use `.env.local` for local development

2. **Use different values for each environment**
   - Development, staging, and production should have different keys
   - Never use production keys in development

3. **Rotate keys regularly**
   - Paystack: Rotate every 6 months
   - YouVerify: Rotate every 6 months
   - Database: Rotate every 3 months

4. **Monitor key usage**
   - Check Paystack dashboard for unauthorized transactions
   - Check YouVerify dashboard for unusual verification patterns
   - Monitor database logs for suspicious connections

5. **Use strong secrets**
   - `AUTH_SECRET` should be at least 32 characters
   - Use cryptographically secure random generation
   - Never use predictable values

---

## Reference Table

| Variable | Required | Sensitive | Environment | Example |
|----------|----------|-----------|-------------|---------|
| `DATABASE_URL` | Yes | Yes | All | `postgresql://...` |
| `AUTH_SECRET` | Yes | Yes | All | Random 32+ chars |
| `PAYSTACK_PUBLIC_KEY` | Yes | No | All | `pk_test_...` |
| `PAYSTACK_SECRET_KEY` | Yes | Yes | All | `sk_test_...` |
| `YOUVERIFY_TOKEN` | Yes | Yes | All | `tSz5ISav...` |
| `YOUVERIFY_BASE_URL` | Yes | No | All | `https://api...` |

---

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Paystack API Documentation](https://paystack.com/docs/api)
- [YouVerify API Documentation](https://youverify.co/docs)
- [Neon Database Documentation](https://neon.tech/docs)
