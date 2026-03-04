# YouVerify Setup Guide

## Current Issue

You're seeing this error message:
**"The verification service is temporarily unavailable. Your wallet has been refunded. Please try again later or contact support."**

This is the correct behavior when YouVerify returns an "Insufficient fund" error (HTTP 402).

## Root Cause

Your YouVerify production account needs to be funded. The system is working correctly:

1. ✅ User's wallet is debited (₦500)
2. ✅ API calls YouVerify
3. ❌ YouVerify returns: "Insufficient fund"
4. ✅ System automatically refunds user's ₦500
5. ✅ System shows user-friendly error message

## Required Environment Variables

### Minimum Required (Production)

```bash
# Database
DATABASE_URL="your-neon-postgres-url"

# Authentication
AUTH_SECRET="your-secret-key-minimum-32-characters"

# Paystack
PAYSTACK_PUBLIC_KEY="pk_live_..."
PAYSTACK_SECRET_KEY="sk_live_..."

# YouVerify - BOTH ARE REQUIRED
YOUVERIFY_TOKEN="dBlbYlfV.wkI4k41X0XPNxMSw0tTopOQ0gb8jG0OQ2NOE"
YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
```

### Optional Variables

```bash
# Only set if you want to change the default ₦1,000,000 limit
MAX_WALLET_FUNDING_AMOUNT="100000000"
```

## Variables You Can Ignore

These are in `.env.example` but NOT currently used in the code:

- `ENCRYPTION_KEY` - Placeholder for future encryption features
- `MAX_DAILY_VERIFICATIONS_PER_USER` - Not implemented yet
- `MIN_WALLET_FUNDING_AMOUNT` - Not implemented yet
- `SENTRY_DSN` - Error tracking (optional, commented out)
- `LOG_LEVEL` - Not implemented yet
- `ALLOWED_WEBHOOK_IPS` - Not implemented yet
- `DATA_RETENTION_DAYS` - Not implemented yet
- `ENABLE_RATE_LIMITING` - Rate limiting is always enabled
- `ENABLE_AUDIT_LOGGING` - Audit logging is always enabled
- `ENABLE_WEBHOOK_SIGNATURE_VERIFICATION` - Always enabled

## How to Fix the Current Issue

### Step 1: Verify Environment Variables

Check your production environment (Vercel/Netlify/Railway) has:

```bash
YOUVERIFY_TOKEN="dBlbYlfV.wkI4k41X0XPNxMSw0tTopOQ0gb8jG0OQ2NOE"
YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
```

### Step 2: Fund YouVerify Account

1. Log into your YouVerify dashboard
2. Navigate to billing/wallet section
3. Add funds to your account
4. Minimum recommended: ₦50,000 (covers 100+ verifications)

### Step 3: Test

After funding, try verifying a NIN. You should see:
- ✅ Wallet debited: ₦500
- ✅ NIN details returned (name, DOB, phone)
- ✅ Verification successful

## Pricing Breakdown

### Your Costs
- YouVerify charges you per NIN verification (check your dashboard for exact rate)
- Typical range: ₦100-₦300 per verification

### Your Revenue
- You charge users: ₦500 per verification
- Paystack fee: 1.5% + ₦100 = ~₦108 per ₦500 transaction
- Net revenue per verification: ₦500 - ₦108 - YouVerify_cost

### Example Calculation
If YouVerify charges ₦200 per verification:
- User pays: ₦500
- Paystack fee: ₦108
- YouVerify cost: ₦200
- Your profit: ₦192 per verification

## Monitoring YouVerify Balance

### Check Logs
Look for these messages in your production logs:

```
[YOUVERIFY] Response status: 402
[YOUVERIFY] Insufficient funds: Insufficient fund
[NIN] Refund completed after API error
```

This confirms the issue is account funding.

### Successful Verification Logs
After funding, you should see:

```
[YOUVERIFY] Response status: 200
[YOUVERIFY] Success response received
[NIN] NIN found. Updating verification record...
[NIN] Verification successful
```

## Testing Checklist

After funding your YouVerify account:

- [ ] Environment variables set correctly
- [ ] YouVerify account funded
- [ ] Test with real NIN: `92903728700`
- [ ] Verify wallet deduction works
- [ ] Verify NIN details are returned
- [ ] Check receipt download works
- [ ] Test with multiple NINs
- [ ] Monitor YouVerify balance

## Common Issues

### Issue: Still getting "temporarily unavailable" after funding

**Possible causes:**
1. Environment variables not set correctly
2. Need to redeploy after setting variables
3. YouVerify account not actually funded yet

**Solution:**
1. Double-check environment variables in your hosting platform
2. Trigger a new deployment
3. Check YouVerify dashboard for current balance
4. Check production logs for actual error messages

### Issue: Getting different error messages

**Different errors mean different things:**

- "Temporarily unavailable" = YouVerify insufficient funds (402)
- "Too many requests" = Rate limit (429) - wait 10 minutes
- "Insufficient wallet balance" = User needs to fund their wallet
- "NIN not found" = Invalid NIN or not in NIMC database

## Support

If issues persist after funding:

1. Check YouVerify dashboard for:
   - Current balance
   - API usage logs
   - Transaction history

2. Check your application logs for:
   - `[YOUVERIFY]` messages
   - HTTP status codes
   - Error responses

3. Contact YouVerify support:
   - Email: support@youverify.co
   - Provide your token (first 10 chars only)
   - Share error logs

---

**Current Status:**
- ✅ Code is production-ready
- ✅ Error handling works correctly
- ✅ Automatic refunds working
- ⏳ Waiting for YouVerify account funding
