# Support Guide: Payment Issues

## Quick Reference for Support Team

### Common Issue: "Money Deducted But Not in Wallet"

This happens when a user's payment is successful on Paystack but their wallet balance doesn't update due to network interruption.

---

## 🔧 Solution 1: User Self-Service (RECOMMENDED)

**Ask the user to:**

1. Go to their dashboard
2. Scroll to the right column
3. Find the blue card titled "Payment Not Showing?"
4. Enter their payment reference (from Paystack email/SMS)
5. Click "Check Payment Status"

**What happens:**
- System checks Paystack to verify payment
- If successful, wallet is automatically credited
- User sees success message with amount

**Payment Reference Format:**
- Usually starts with `T_` or similar
- Example: `T_abc123xyz456`
- Found in Paystack confirmation email or SMS

---

## 🔧 Solution 2: Admin Manual Recovery

**When to use:**
- User can't find payment reference
- Self-service didn't work
- User needs immediate assistance

**Steps:**

### 1. Get Information from User
- Payment reference (from Paystack)
- Amount paid
- Date/time of payment
- User's email address

### 2. Verify on Paystack Dashboard
- Login to [dashboard.paystack.com](https://dashboard.paystack.com)
- Go to Transactions
- Search for the reference
- Confirm:
  - Status is "Success"
  - Amount matches what user paid
  - Customer email matches user's account

### 3. Get User ID from Database
```sql
SELECT id, email, full_name FROM users WHERE email = 'user@example.com';
```

### 4. Run Reconciliation Command

**Important:** You need the `ADMIN_SECRET_KEY` from environment variables.

```bash
curl -X POST https://your-domain.com/api/admin/reconcile-payment \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_SECRET_KEY" \
  -H "Cookie: auth-token=YOUR_SESSION_TOKEN" \
  -d '{
    "reference": "T_abc123xyz",
    "userId": "user_abc123"
  }'
```

**Expected Response:**
```json
{
  "message": "Payment reconciled successfully",
  "reference": "T_abc123xyz",
  "userId": "user_abc123",
  "amount": 100000,
  "newBalance": 150000,
  "reconciledBy": "admin_user_id"
}
```

### 5. Confirm with User
- Ask user to refresh their dashboard
- Verify balance is updated
- Confirm they can now verify NIN

---

## 📋 Troubleshooting

### Error: "Payment not found or does not belong to you"
**Cause:** Payment reference is wrong or belongs to different user  
**Solution:** 
- Double-check payment reference
- Verify user's email matches Paystack customer email
- Check if payment was actually successful on Paystack

### Error: "Payment was not successful"
**Cause:** Payment failed on Paystack side  
**Solution:**
- Check Paystack dashboard for payment status
- If failed: User needs to make new payment
- If pending: Wait for payment to complete
- If abandoned: User cancelled payment

### Error: "Payment already processed"
**Cause:** Wallet was already credited  
**Solution:**
- Ask user to refresh dashboard
- Check transaction history
- Verify balance is correct

### Error: "Forbidden" (403)
**Cause:** Admin key is missing or incorrect  
**Solution:**
- Check `ADMIN_SECRET_KEY` environment variable
- Ensure using correct header: `x-admin-key`
- Verify you're logged in as admin

---

## 🔍 How to Investigate

### Check Database

**1. Check if transaction exists:**
```sql
SELECT * FROM wallet_transactions 
WHERE reference = 'T_abc123xyz';
```

**2. Check user's wallet:**
```sql
SELECT w.*, u.email, u.full_name
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE u.email = 'user@example.com';
```

**3. Check audit logs:**
```sql
SELECT * FROM audit_logs 
WHERE event_type LIKE 'payment%' 
AND metadata->>'reference' = 'T_abc123xyz'
ORDER BY timestamp DESC;
```

### Check Paystack Dashboard

1. Login to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to Transactions
3. Search by reference or email
4. Check:
   - Transaction status
   - Amount
   - Customer email
   - Date/time
   - Any error messages

---

## 📊 Common Scenarios

### Scenario 1: Payment Successful, Webhook Failed
**Symptoms:** Payment shows "Success" on Paystack, but wallet not updated  
**Cause:** Webhook didn't reach our server (network issue, server down)  
**Solution:** User self-service or admin reconciliation

### Scenario 2: User Lost Connection During Payment
**Symptoms:** Money deducted, user doesn't know if payment succeeded  
**Cause:** User closed browser or lost internet during payment  
**Solution:** User self-service with payment reference

### Scenario 3: Duplicate Payment Attempt
**Symptoms:** User paid twice, only one shows in wallet  
**Cause:** User clicked "Pay" multiple times  
**Solution:** Check both references, reconcile if needed

### Scenario 4: Wrong Amount Credited
**Symptoms:** User paid ₦1000 but only ₦500 credited  
**Cause:** System error or wrong amount in transaction  
**Solution:** Admin reconciliation will credit correct amount

---

## ⚠️ Important Notes

1. **Always verify on Paystack first** before crediting wallet
2. **Never manually update database** without using reconciliation endpoint
3. **Log all manual interventions** for audit trail
4. **Payment references are unique** - can only be processed once
5. **User must be logged in** to use self-service
6. **Admin key is sensitive** - never share publicly

---

## 🚨 Escalation

**Escalate to developer if:**
- Reconciliation endpoint returns 500 error
- Payment shows "Success" on Paystack but reconciliation fails
- User reports multiple payments not showing
- Webhook signature verification failing repeatedly
- Database connection errors

---

## 📞 Contact Information

**Paystack Support:**
- Email: support@paystack.com
- Phone: +234 1 888 3333
- Dashboard: [dashboard.paystack.com](https://dashboard.paystack.com)

**Internal Escalation:**
- Technical issues: Contact development team
- Database access: Contact system administrator
- Admin key issues: Contact system administrator

---

## ✅ Prevention Tips

**Tell users to:**
1. Keep stable internet connection during payment
2. Don't close browser until payment confirms
3. Save payment reference from Paystack email
4. Wait 1-2 minutes for balance to update
5. Use "Refresh Balance" button before contacting support

**For support team:**
1. Always ask for payment reference first
2. Check Paystack dashboard before taking action
3. Document all manual reconciliations
4. Follow up with user after resolution
5. Report patterns to development team

---

**Last Updated:** March 6, 2026  
**Version:** 1.0
