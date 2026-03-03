# YouVerify Sandbox Testing Guide

This guide provides test NIN numbers and instructions for testing NIN verification in the sandbox environment.

## Current Setup

Your production application is currently using YouVerify's **sandbox environment** for testing:

- **Token**: `tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB`
- **Base URL**: `https://api.sandbox.youverify.co/v1`
- **Cost**: Free and unlimited

This is perfect for testing before switching to production.

---

## Test NIN Numbers

Use these test NINs to verify the sandbox environment is working correctly:

### Valid Test NINs

These NINs will return successful verification with mock data:

| NIN | Status | First Name | Last Name | DOB | Phone |
|-----|--------|-----------|-----------|-----|-------|
| `11111111111` | Found | Test | User | 1990-01-01 | 08012345678 |
| `22222222222` | Found | John | Doe | 1985-05-15 | 08087654321 |
| `33333333333` | Found | Jane | Smith | 1992-03-20 | 08098765432 |
| `44444444444` | Found | Ahmed | Hassan | 1988-07-10 | 08011223344 |
| `55555555555` | Found | Chioma | Okafor | 1995-11-25 | 08055667788 |

### Invalid Test NINs

These NINs will return "not found" errors:

| NIN | Status | Expected Response |
|-----|--------|-------------------|
| `00000000000` | Not Found | NIN not found |
| `99999999999` | Not Found | NIN not found |
| `12345678901` | Not Found | NIN not found |

---

## Testing Steps

### Step 1: Fund Your Wallet

1. Go to the dashboard at `https://jamb-verify.vercel.app/dashboard`
2. Click "Fund wallet"
3. Enter an amount (minimum ₦500)
4. Complete the Paystack payment
5. Wait for the balance to update (should show your funded amount)

**Note**: If balance doesn't update immediately:
- Click "Refresh balance" button
- Wait 2-3 seconds
- The balance should update

### Step 2: Verify a Test NIN

1. In the "NIN verification" section, enter a test NIN from the table above
2. Example: `11111111111`
3. Check the consent checkbox
4. Click "Verify NIN"
5. Wait for the verification to complete

### Step 3: Check Results

**Successful Verification** (for valid test NINs):
- You should see a success message
- The message will show: "Verification successful"
- A "View receipt" link will appear
- Your wallet balance will decrease by ₦500

**Failed Verification** (for invalid test NINs):
- You should see an error message
- The message will show: "NIN not found. Wallet refunded."
- Your wallet balance will be refunded
- No receipt will be generated

---

## Testing Scenarios

### Scenario 1: Successful Verification

**Steps**:
1. Fund wallet with ₦1,000
2. Verify NIN `11111111111`
3. Check consent box
4. Click "Verify NIN"

**Expected Result**:
- Success message appears
- Wallet balance decreases to ₦500
- Receipt is generated
- Can view receipt details

### Scenario 2: Insufficient Balance

**Steps**:
1. Fund wallet with ₦200 (less than ₦500 fee)
2. Try to verify any NIN
3. Click "Verify NIN"

**Expected Result**:
- Error message: "Insufficient wallet balance"
- Wallet balance remains unchanged
- No verification is attempted

### Scenario 3: Invalid NIN

**Steps**:
1. Fund wallet with ₦1,000
2. Verify NIN `00000000000`
3. Check consent box
4. Click "Verify NIN"

**Expected Result**:
- Error message: "NIN not found. Wallet refunded."
- Wallet balance returns to ₦1,000
- No receipt is generated

### Scenario 4: Multiple Verifications

**Steps**:
1. Fund wallet with ₦5,000
2. Verify NIN `11111111111` (success)
3. Verify NIN `22222222222` (success)
4. Verify NIN `00000000000` (fails, refunded)
5. Verify NIN `33333333333` (success)

**Expected Result**:
- After step 2: Balance = ₦4,500
- After step 3: Balance = ₦4,000
- After step 4: Balance = ₦4,500 (refunded)
- After step 5: Balance = ₦4,000
- 3 successful receipts generated

---

## Troubleshooting

### Issue: "We couldn't complete the verification. Please try again."

**Possible Causes**:
1. Wallet balance is insufficient
2. Network connection issue
3. YouVerify API is temporarily unavailable
4. Invalid NIN format

**Solutions**:
1. Check wallet balance (should be at least ₦500)
2. Verify NIN format is 11 digits
3. Try again in a few seconds
4. Check browser console for detailed error

### Issue: Wallet Balance Not Updating After Payment

**Possible Causes**:
1. Payment webhook not processed yet
2. Browser cache issue
3. Database connection delay

**Solutions**:
1. Wait 3-5 seconds after payment completes
2. Click "Refresh balance" button
3. Hard refresh browser (Cmd+Shift+R on Mac)
4. Check that payment shows in Paystack dashboard

### Issue: NIN Verification Fails with Valid Test NIN

**Possible Causes**:
1. Using production token instead of sandbox
2. Using wrong API endpoint
3. Token has expired

**Solutions**:
1. Verify `.env` has sandbox token: `tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB`
2. Verify `.env` has sandbox URL: `https://api.sandbox.youverify.co/v1`
3. Contact YouVerify support if token expired

---

## Testing Checklist

Use this checklist to verify all functionality works:

- [ ] Can fund wallet with Paystack
- [ ] Wallet balance updates after payment
- [ ] Can verify valid test NIN (11111111111)
- [ ] Successful verification shows correct data
- [ ] Receipt is generated for successful verification
- [ ] Invalid NIN returns error
- [ ] Wallet is refunded for failed verification
- [ ] Insufficient balance prevents verification
- [ ] Multiple verifications work correctly
- [ ] Transaction history shows all transactions
- [ ] Can download receipt as PDF

---

## Switching to Production

When you're ready to use production YouVerify:

1. **Get Production Token**:
   - Create YouVerify account
   - Request production access
   - Receive production token

2. **Update Environment Variables**:
   ```env
   YOUVERIFY_TOKEN="your_production_token_here"
   YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
   ```

3. **Test with Real NINs**:
   - Use actual NINs for testing
   - Verify against real NIMC database
   - Costs will apply per verification

4. **Deploy to Production**:
   - Commit changes
   - Push to production
   - Monitor for errors

---

## Cost Estimation

### Sandbox (Current)
- **Cost per verification**: Free
- **Limit**: Unlimited
- **Data**: Mock/test data only

### Production
- **Cost per verification**: ₦500 - ₦1,000 (varies by plan)
- **Limit**: Depends on subscription
- **Data**: Real NIMC database

---

## Support

### YouVerify Sandbox Documentation
- [YouVerify API Docs](https://youverify.co/docs)
- [Sandbox Environment Guide](https://youverify.co/docs/sandbox)
- [Test Data Reference](https://youverify.co/docs/test-data)

### Your Application
- Check browser console for detailed errors
- Review server logs for API errors
- Contact support if issues persist

---

## Next Steps

1. **Test thoroughly** with sandbox NINs
2. **Verify all scenarios** work correctly
3. **Document any issues** encountered
4. **Plan production migration** when ready
5. **Get production token** from YouVerify
6. **Update environment variables**
7. **Deploy to production**

---

## Quick Reference

**Sandbox Environment**:
- Token: `tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB`
- URL: `https://api.sandbox.youverify.co/v1`
- Cost: Free
- Test NIN: `11111111111`

**Production Environment** (when ready):
- Token: `your_production_token_here`
- URL: `https://api.youverify.co/v2`
- Cost: ₦500-₦1,000 per verification
- Real NINs: Use actual NINs

