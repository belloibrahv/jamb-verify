# NIN Verification Debugging Guide

## Issue: NIN Verification Returns 502 Error

When you see "We couldn't complete the verification. Please try again." with a 502 error, it means the YouVerify API call failed.

## Common Causes

### 1. YouVerify API is Down or Slow
**Symptoms**: 502 error, timeout errors
**Check**: 
- YouVerify status page (if available)
- Try the API directly with curl (see below)

### 2. Invalid Token
**Symptoms**: 401 or 403 errors
**Check**: 
- Verify `YOUVERIFY_TOKEN` in Vercel environment variables
- Token should match the one in `.env`

### 3. Wrong API Endpoint
**Symptoms**: 404 errors
**Check**: 
- Verify `YOUVERIFY_BASE_URL` is set to `https://api.sandbox.youverify.co/v2`
- NOT v1 endpoint

### 4. Network Issues
**Symptoms**: Timeout, connection refused
**Check**: 
- Vercel function logs for network errors
- Check if Vercel can reach external APIs

## Debugging Steps

### Step 1: Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" > Latest > "Functions"
4. Search for `[NIN]` or `[YOUVERIFY]`

**Look for these log patterns**:

**Success**:
```
[NIN] Verification request from user: user_id
[NIN] Checking wallet balance...
[NIN] Creating verification record and debiting wallet...
[NIN] Wallet debited. Calling YouVerify API...
[YOUVERIFY] Calling API with NIN: 111********
[YOUVERIFY] Base URL: https://api.sandbox.youverify.co/v2
[YOUVERIFY] Response status: 200
[YOUVERIFY] Success response received
[NIN] YouVerify response: {...}
[NIN] NIN found. Updating verification record...
[NIN] Verification successful
```

**Failure - API Error**:
```
[NIN] Wallet debited. Calling YouVerify API...
[YOUVERIFY] Calling API with NIN: 111********
[YOUVERIFY] Response status: 500
[YOUVERIFY] Error response: Internal Server Error
[NIN] YouVerify API error: Error: YouVerify API error (500): Internal Server Error
[NIN] Starting refund process. Reason: Verification provider error
[NIN] Refund completed after API error
```

**Failure - Network Error**:
```
[NIN] Wallet debited. Calling YouVerify API...
[YOUVERIFY] Calling API with NIN: 111********
[YOUVERIFY] Request failed: FetchError: request to https://api.sandbox.youverify.co/v2/api/identity/ng/nin failed
[NIN] YouVerify API error: FetchError: request failed
[NIN] Starting refund process. Reason: Verification provider error
```

### Step 2: Test YouVerify API Directly

Test the API from your terminal to see if it's working:

```bash
curl -X POST "https://api.sandbox.youverify.co/v2/api/identity/ng/nin" \
  -H "token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"id": "11111111111", "isSubjectConsent": true}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "status": "found",
    "firstName": "Sarah",
    "lastName": "Doe",
    ...
  }
}
```

**Error Response** (500):
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Step 3: Check Environment Variables

Verify the environment variables are set correctly in Vercel:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Check these variables:
   - `YOUVERIFY_TOKEN` - Should be your sandbox token
   - `YOUVERIFY_BASE_URL` - Should be `https://api.sandbox.youverify.co/v2`

### Step 4: Check Wallet Balance

The error might occur if:
- Wallet was debited but refund failed
- User doesn't have enough balance

**Check in Vercel logs**:
```
[NIN] Insufficient balance. Current: 0 Required: 50000
```

**Solution**: Fund the wallet first, then try verification again.

### Step 5: Check for Duplicate Verifications

If the same NIN is verified multiple times quickly, it might cause issues.

**Check in Vercel logs**:
```
[NIN] Transaction already completed. Skipping update.
```

## Common Error Messages

### "We couldn't reach the verification provider. Your wallet has been refunded."

**Meaning**: YouVerify API call failed completely (network error, timeout, etc.)

**What Happens**:
1. Wallet is debited
2. API call fails
3. Automatic refund is triggered
4. User sees this error message

**Check**:
- Vercel logs for `[YOUVERIFY]` errors
- Test API directly with curl
- Check YouVerify service status

### "Insufficient wallet balance"

**Meaning**: User doesn't have ₦500 in their wallet

**Solution**: Fund wallet first

### "Please enter a valid 11-digit NIN"

**Meaning**: NIN format is invalid

**Solution**: Ensure NIN is exactly 11 digits

### "Consent is required for NIN verification"

**Meaning**: User didn't check the consent checkbox

**Solution**: Check the consent box

## Refund Process

When verification fails, the system automatically refunds the wallet:

1. **Mark verification as failed**:
   ```sql
   UPDATE nin_verifications SET status = 'failed', errorMessage = 'reason'
   ```

2. **Mark debit transaction as refunded**:
   ```sql
   UPDATE wallet_transactions SET status = 'refunded'
   ```

3. **Create refund transaction**:
   ```sql
   INSERT INTO wallet_transactions (type = 'refund', amount = 50000)
   ```

4. **Credit wallet back**:
   ```sql
   UPDATE wallets SET balance = balance + 50000
   ```

**Check refund in logs**:
```
[NIN] Starting refund process. Reason: Verification provider error
[NIN] Refund attempt 1/3
[NIN] Refund completed successfully
```

## Testing with Sandbox

YouVerify sandbox provides test NIMs:

**Test NIN**: `11111111111`

**Expected Response**:
- Status: "found"
- Name: Sarah Jane Doe
- DOB: 1988-04-04
- State: Edo

**To Test**:
1. Fund wallet with ₦500
2. Enter NIN: `11111111111`
3. Check consent box
4. Click "Verify NIN"
5. Should return success with candidate details

## Production Considerations

When moving to production:

1. **Update Token**: Replace sandbox token with production token
2. **Update Base URL**: Change to production endpoint (if different)
3. **Test Thoroughly**: Test with real NIMs in production
4. **Monitor Errors**: Set up error monitoring (Sentry, etc.)
5. **Rate Limiting**: Be aware of YouVerify rate limits

## Troubleshooting Checklist

- [ ] Check Vercel logs for `[NIN]` and `[YOUVERIFY]` entries
- [ ] Verify environment variables are set correctly
- [ ] Test YouVerify API directly with curl
- [ ] Check wallet balance is sufficient (₦500)
- [ ] Verify NIN format is correct (11 digits)
- [ ] Check consent box is checked
- [ ] Look for refund logs if verification failed
- [ ] Check if YouVerify service is operational

## Support

If issues persist:
1. Check YouVerify documentation: https://developer.youverify.co
2. Contact YouVerify support: support@youverify.co
3. Share Vercel logs with reference to the specific verification attempt
4. Include the masked NIN (first 3 digits only) for reference

## Recent Improvements

- Added comprehensive logging with `[NIN]` and `[YOUVERIFY]` prefixes
- Improved error handling with try-catch around refund
- Added response status and headers logging
- Masked NIN in logs for security (show only first 3 digits)
- Better error messages with HTTP status codes
