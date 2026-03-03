# Wallet Balance Update Debugging Guide

## Issue

After successful Paystack payment, the wallet balance is not updating in the UI. The payment completes successfully, but the balance remains ₦0.

## Root Cause Analysis

The issue is likely one of these:

1. **Transaction record not created** - The wallet transaction record isn't being created during payment initialization
2. **Transaction record not found** - The verify endpoint can't find the transaction by reference
3. **Webhook not configured** - Paystack webhook isn't configured to call your endpoint
4. **Database update failing silently** - The SQL update isn't working as expected

## How to Debug

### Step 1: Check Vercel Logs

1. Go to your Vercel project dashboard
2. Click "Deployments" → Latest deployment
3. Click "Runtime Logs"
4. Look for logs from the verify endpoint with the reference number

**Expected logs should show**:
```
Verifying payment with reference: [reference]
Paystack verification response: {...}
Payment verified. Amount: [amount]
Looking for transaction with reference: [reference]
Found transaction: {id: ..., userId: ..., status: ...}
Updating transaction status to completed
Updating wallet balance for user: [userId] Amount: [amount]
Wallet updated successfully
```

### Step 2: Check if Transaction Record Exists

Run this query in your Neon database console:

```sql
SELECT * FROM wallet_transactions 
WHERE reference LIKE 'jv_%' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected result**: Should show pending transactions with references like `jv_abc123def456`

### Step 3: Check Wallet Record

```sql
SELECT id, user_id, balance, updated_at 
FROM wallets 
ORDER BY updated_at DESC 
LIMIT 5;
```

**Expected result**: Should show wallets with updated timestamps

### Step 4: Test Payment Flow Manually

1. **Fund wallet** with ₦500
2. **Open browser DevTools** → Network tab
3. **Look for the verify request** after payment closes
4. **Check the response** - should be `{"success": true}`
5. **Check Vercel logs** for the detailed logging output

### Step 5: Check Paystack Dashboard

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Click "Transactions"
3. Find your test transaction
4. Verify the status is "Completed"
5. Note the reference number

## Common Issues & Solutions

### Issue: "Transaction not found for reference"

**Cause**: The transaction record wasn't created during initialization

**Solution**:
1. Check the initialize endpoint logs
2. Verify the transaction is being inserted into the database
3. Check if there's a database connection issue

**Debug query**:
```sql
SELECT * FROM wallet_transactions 
WHERE user_id = '[your-user-id]' 
ORDER BY created_at DESC;
```

### Issue: "Payment not successful"

**Cause**: Paystack verification returned status other than "success"

**Solution**:
1. Check the Paystack response in logs
2. Verify the payment actually completed in Paystack dashboard
3. Check if the reference is correct

### Issue: Logs show success but balance doesn't update

**Cause**: Database update is failing silently or transaction is already completed

**Solution**:
1. Check if transaction status is already "completed"
2. Verify the wallet record exists for the user
3. Check database permissions

**Debug query**:
```sql
SELECT * FROM wallet_transactions 
WHERE reference = '[reference]';

SELECT * FROM wallets 
WHERE user_id = '[user-id]';
```

## Testing Checklist

- [ ] Payment initializes successfully (reference generated)
- [ ] Payment completes in Paystack popup
- [ ] Verify endpoint is called (check network tab)
- [ ] Verify endpoint returns `{"success": true}`
- [ ] Vercel logs show all expected log messages
- [ ] Transaction record exists in database
- [ ] Wallet balance is updated in database
- [ ] UI refreshes to show new balance

## Detailed Logging Output

After the fix, when you fund your wallet, you should see logs like:

```
Verifying payment with reference: jv_abc123def456
Paystack verification response: {
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "reference": "jv_abc123def456",
    "status": "success",
    "amount": 50000,
    ...
  }
}
Payment verified. Amount: 50000
Looking for transaction with reference: jv_abc123def456
Found transaction: {id: "txn_123", userId: "user_456", status: "pending"}
Updating transaction status to completed
Updating wallet balance for user: user_456 Amount: 50000
Wallet updated successfully
```

## Next Steps

1. **Redeploy** the updated code to Vercel
2. **Test payment** again
3. **Check Vercel logs** for the detailed output
4. **Share the logs** if the issue persists

## Database Queries for Investigation

### Check all transactions for a user
```sql
SELECT id, type, status, amount, reference, created_at 
FROM wallet_transactions 
WHERE user_id = '[user-id]' 
ORDER BY created_at DESC;
```

### Check wallet balance history
```sql
SELECT id, user_id, balance, updated_at 
FROM wallets 
WHERE user_id = '[user-id]';
```

### Check for failed transactions
```sql
SELECT * FROM wallet_transactions 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check for pending transactions
```sql
SELECT * FROM wallet_transactions 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Webhook Configuration

If the webhook isn't configured in Paystack:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Click "Settings" → "API Keys & Webhooks"
3. Scroll to "Webhooks"
4. Add webhook URL: `https://jamb-verify.vercel.app/api/paystack/webhook`
5. Select events: `charge.success`
6. Save

## Support

If you're still having issues:

1. Check the Vercel logs for error messages
2. Verify the database connection is working
3. Ensure the transaction record is being created
4. Check if the wallet record exists for the user
5. Verify the SQL update is working correctly

The detailed logging should help identify exactly where the issue is occurring.
