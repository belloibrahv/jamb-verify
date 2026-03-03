# How to Check Vercel Logs for Wallet Update Debugging

## Quick Steps

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Select your "jamb-verify" project

### 2. Access Runtime Logs
- Click on the latest **Deployment** (should show a green checkmark)
- Click the **"Deployments"** tab if not already there
- Find the most recent deployment
- Click on it to open deployment details
- Click **"Runtime Logs"** tab (or "Logs" button)

### 3. Test the Payment Flow
While the logs are open:
1. Go to your app: https://jamb-verify.vercel.app/dashboard
2. Click "Fund wallet"
3. Enter amount: **40000** (₦400)
4. Click "Fund wallet" button
5. Complete the Paystack payment (use test card: 4111 1111 1111 1111)
6. Wait for popup to close
7. Watch the logs in real-time

### 4. What to Look For in Logs

**Expected log sequence**:

```
Initializing payment. User: [user-id] Amount: 4000000 Reference: jv_abc123def456
Wallet found. Creating transaction record...
Transaction record created. Initializing Paystack...
Paystack initialized. Access code: [access-code]

[After payment completes]

Verifying payment with reference: jv_abc123def456
Paystack verification response: {...}
Payment verified. Amount: 4000000
Looking for transaction with reference: jv_abc123def456
Found transaction: {id: ..., userId: ..., status: pending}
Updating transaction status to completed
Updating wallet balance for user: [user-id] Amount: 4000000
Wallet updated successfully

Fetching wallet balance for user: [user-id]
Wallet found. Balance: 4000000 Updated at: [timestamp]
```

## Troubleshooting Based on Logs

### If you see: "Wallet not found for user"
**Problem**: User doesn't have a wallet record
**Solution**: 
- Log out and log back in
- This should trigger wallet creation during registration

### If you see: "Transaction not found for reference"
**Problem**: The transaction record wasn't created during initialization
**Solution**:
- Check if the initialize endpoint logs show the transaction was created
- Verify the database connection is working

### If you see: "Payment not successful"
**Problem**: Paystack verification returned a non-success status
**Solution**:
- Check the Paystack verification response in the logs
- Verify the payment actually completed in Paystack dashboard

### If logs show success but balance doesn't update in UI
**Problem**: Database update succeeded but UI isn't refreshing
**Solution**:
- The balance refresh logic in the dashboard might need adjustment
- Try clicking "Refresh balance" button manually
- Check if the balance endpoint is returning the updated value

## Accessing Logs from Different Locations

### Option 1: From Vercel Dashboard (Recommended)
1. https://vercel.com/dashboard
2. Select project
3. Click latest deployment
4. Click "Runtime Logs" tab

### Option 2: From Vercel CLI
```bash
vercel logs --follow
```

### Option 3: From GitHub
1. Go to your GitHub repo
2. Click "Deployments" tab
3. Find the Vercel deployment
4. Click "View deployment"
5. Look for logs link

## Log Filtering Tips

In the Vercel logs interface:
- **Search**: Use Ctrl+F to search for specific text
- **Filter by endpoint**: Search for "Initializing payment" or "Verifying payment"
- **Filter by user**: Search for your user ID
- **Filter by reference**: Search for the reference number (jv_...)

## Common Reference Numbers

When you fund wallet, the reference will look like:
- `jv_abc123def456` (10 random characters after `jv_`)

You can search for this in logs to track the entire payment flow.

## Real-Time Monitoring

To watch logs in real-time:
1. Open Vercel logs
2. Keep the page open
3. Perform the payment
4. Logs will appear automatically as they're generated

## Saving Logs for Analysis

If you need to share logs with support:
1. Select all logs (Ctrl+A)
2. Copy (Ctrl+C)
3. Paste into a text file
4. Share the file

## What Each Log Message Means

| Log Message | Meaning |
|-------------|---------|
| `Initializing payment` | Payment initialization started |
| `Wallet found` | User's wallet exists in database |
| `Transaction record created` | Payment transaction saved to database |
| `Paystack initialized` | Paystack API responded successfully |
| `Verifying payment` | Checking if payment was successful |
| `Payment verified` | Paystack confirmed payment success |
| `Looking for transaction` | Searching database for transaction record |
| `Found transaction` | Transaction record found in database |
| `Updating transaction status` | Marking transaction as completed |
| `Updating wallet balance` | Adding funds to wallet |
| `Wallet updated successfully` | Balance update completed |
| `Fetching wallet balance` | User requested balance check |
| `Wallet found. Balance:` | Current wallet balance |

## Next Steps After Checking Logs

1. **If logs show success**: The issue is in the UI refresh logic
   - Try clicking "Refresh balance" manually
   - Check if balance endpoint is returning updated value

2. **If logs show error**: Share the error message
   - Note the exact error
   - Check what step failed
   - Provide the reference number

3. **If logs don't show payment verification**: 
   - The verify endpoint might not be called
   - Check if Paystack webhook is configured
   - Verify the reference is being passed correctly

## Database Verification

After checking logs, you can verify in the database:

```sql
-- Check if transaction was created
SELECT * FROM wallet_transactions 
WHERE reference LIKE 'jv_%' 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if wallet balance was updated
SELECT id, user_id, balance, updated_at 
FROM wallets 
ORDER BY updated_at DESC 
LIMIT 1;
```

## Support

If you're still having issues after checking logs:
1. Share the complete log output
2. Include the reference number
3. Include your user ID
4. Include the timestamp of the payment attempt
5. Include any error messages from the logs
