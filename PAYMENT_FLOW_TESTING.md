# Payment Flow Testing Guide

## Overview

This guide helps you test the complete wallet funding flow from payment initialization through balance update.

## What Was Fixed

The wallet balance update issue had multiple root causes:

1. **Balance comparison logic**: The previous code checked if `balance > 0`, which doesn't detect if the balance actually increased. Fixed by storing the previous balance and comparing against it.

2. **Missing logging**: Added comprehensive logging at each step to track where the flow breaks.

3. **Callback reliability**: The `onClose` callback now includes better error handling and user feedback.

## Testing the Payment Flow

### Step 1: Check Initial Balance

1. Log in to the dashboard
2. Note the current balance displayed in the "Wallet funding" card
3. Open browser DevTools (F12) and go to the Network tab

### Step 2: Initiate Payment

1. Enter an amount (minimum ₦500)
2. Click "Fund wallet"
3. In the Network tab, verify:
   - `POST /api/paystack/initialize` returns 200 with `accessCode` and `reference`
   - The reference should look like `jv_XXXXXXXXXX`

### Step 3: Complete Payment in Paystack

1. The Paystack popup should open
2. Use test card: `4111 1111 1111 1111`
3. Expiry: Any future date (e.g., 12/25)
4. CVV: Any 3 digits (e.g., 123)
5. Click "Pay"
6. Complete any additional verification if prompted

### Step 4: Monitor the onClose Callback

After payment completes and the popup closes:

1. Check browser console (F12 > Console tab) for logs like:
   - "Payment popup closed. Reference: jv_XXXXXXXXXX"
   - "Verify attempt 1 for reference: jv_XXXXXXXXXX"
   - "Balance fetch attempt 1"
   - "Current balance: XXXX Previous balance: XXXX"

2. In the Network tab, verify these requests occur:
   - `GET /api/paystack/verify?reference=jv_XXXXXXXXXX` (should return 200)
   - `GET /api/wallet/balance` (should return 200 with updated balance)

### Step 5: Verify Balance Update

1. The balance should update in the UI
2. You should see a success message: "Wallet funded successfully!"
3. The new balance should be: `previous balance + amount funded`

## Debugging Failed Updates

### If Balance Doesn't Update

Check the browser console for these logs:

**Success scenario:**
```
Payment popup closed. Reference: jv_abc123
Verify attempt 1 for reference: jv_abc123
Verify successful
Balance fetch attempt 1
Current balance: 50000 Previous balance: 0
Balance updated successfully
```

**Failure scenario - Verify endpoint not called:**
```
Payment popup closed. Reference: jv_abc123
(no verify logs appear)
```
**Solution**: Check if the `onClose` callback is firing. This might be a Paystack library issue.

**Failure scenario - Verify returns error:**
```
Verify attempt 1 for reference: jv_abc123
Verify failed with status: 404
```
**Solution**: Check Vercel logs to see if the transaction record was created in the database.

**Failure scenario - Balance not increasing:**
```
Current balance: 0 Previous balance: 0
Balance may not have updated. Please refresh manually.
```
**Solution**: Check Vercel logs for database update errors.

## Checking Vercel Logs

1. Go to https://vercel.com/dashboard
2. Select your project (jamb-verify)
3. Click "Deployments" tab
4. Click the latest deployment
5. Click "Logs" tab
6. Search for your reference number (e.g., `jv_abc123`)

Look for these log patterns:

**Initialize endpoint:**
```
Initializing payment. User: user_id Amount: 50000 Reference: jv_abc123
Wallet found. Creating transaction record...
Transaction record created. Initializing Paystack...
Paystack initialized. Access code: xxxxx
```

**Verify endpoint:**
```
Verifying payment with reference: jv_abc123
Paystack verification response: {...}
Payment verified. Amount: 50000
Looking for transaction with reference: jv_abc123
Found transaction: {id: xxx, userId: xxx, status: pending}
Updating transaction status to completed
Updating wallet balance for user: user_id Amount: 50000
Wallet updated successfully
```

**Webhook endpoint:**
```
Webhook received. Verifying signature...
Webhook event: charge.success
Processing charge.success. Reference: jv_abc123 Amount: 50000
Webhook processing completed successfully
```

## Common Issues and Solutions

### Issue: "We couldn't start the payment. Please try again."

**Cause**: Payment initialization failed

**Debug steps**:
1. Check if wallet exists: Verify endpoint logs should show "Wallet found"
2. Check Paystack credentials: Ensure `PAYSTACK_SECRET_KEY` is correct in `.env`
3. Check amount: Must be at least 500 kobo (₦5)

### Issue: Payment completes but balance doesn't update

**Cause**: Verify endpoint not being called or database update failing

**Debug steps**:
1. Check browser console for verify logs
2. Check Vercel logs for database errors
3. Manually verify payment: Open browser console and run:
   ```javascript
   fetch('/api/paystack/verify?reference=jv_abc123').then(r => r.json()).then(console.log)
   ```

### Issue: "Payment verification failed" error

**Cause**: Paystack API returned error or transaction not found

**Debug steps**:
1. Check if reference is correct
2. Check if transaction was created in database
3. Verify Paystack secret key is correct

### Issue: Balance shows but doesn't increase

**Cause**: Balance fetch working but database update failed

**Debug steps**:
1. Check Vercel logs for SQL errors
2. Verify wallet record exists for user
3. Check if transaction status is "pending" (not "completed")

## Manual Testing via API

You can test the endpoints directly using curl:

### Test Initialize Endpoint

```bash
curl -X POST https://jamb-verify.vercel.app/api/paystack/initialize \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{"amount": 500}'
```

### Test Verify Endpoint

```bash
curl https://jamb-verify.vercel.app/api/paystack/verify?reference=jv_abc123 \
  -H "Cookie: your_session_cookie"
```

### Test Balance Endpoint

```bash
curl https://jamb-verify.vercel.app/api/wallet/balance \
  -H "Cookie: your_session_cookie"
```

## Next Steps

1. Test the payment flow following the steps above
2. Check browser console and Vercel logs for any errors
3. If balance still doesn't update, share the console logs and Vercel logs
4. The logging added will help identify exactly where the flow breaks

## Key Changes Made

- **dashboard-client.tsx**: Fixed balance comparison logic, added comprehensive logging, added user feedback messages
- **All API endpoints**: Already have detailed logging for debugging
- **Webhook**: Already properly updates balance on charge.success event

The fix ensures that:
1. Previous balance is captured before payment
2. New balance is compared against previous balance (not just checking > 0)
3. All steps are logged for debugging
4. User gets clear feedback on success or failure
