# Production Setup Guide

This guide covers everything needed to transition your JAMB Verify application from staging to production. It includes detailed information about Paystack and YouVerify, the two critical payment and identity verification providers.

## Table of Contents

1. [Overview](#overview)
2. [Paystack Production Setup](#paystack-production-setup)
3. [YouVerify Production Setup](#youverify-production-setup)
4. [Current Staging Configuration](#current-staging-configuration)
5. [Transition Checklist](#transition-checklist)
6. [Cost Breakdown](#cost-breakdown)

---

## Overview

Your application uses two external services:

- **Paystack**: Handles wallet funding through card and bank transfer payments
- **YouVerify**: Verifies National Identification Numbers (NIN) against NIMC records

Both services offer free integration with pay-as-you-go pricing. You only pay when transactions occur.

---

## Paystack Production Setup

### What is Paystack?

Paystack is a payment processing platform that allows users to fund their wallet using credit cards, debit cards, and bank transfers. It handles all payment security and compliance requirements.

### Current Staging Setup

Your app currently uses Paystack test keys:
- Public Key: `pk_test_ec5ed34324eb8df91a9f02c494da3efb9ca01699`
- Secret Key: `sk_test_37780b726b59580bca6a7084a5424622aa7054f7`

These test keys allow you to process fake payments without charging real money. Test transactions use test card numbers like `4111 1111 1111 1111`.

### How to Get Production Keys

#### Step 1: Create a Paystack Account

1. Go to [paystack.com](https://paystack.com)
2. Click "Sign Up" in the top right
3. Enter your email address and create a password
4. Verify your email by clicking the link sent to your inbox
5. Complete your account setup with your business information

#### Step 2: Verify Your Business

Paystack requires business verification before you can process live payments:

1. Log in to your Paystack dashboard
2. Go to Settings → Business
3. Upload required documents:
   - Business registration certificate
   - Valid government-issued ID
   - Proof of address (utility bill or bank statement)
4. Wait for Paystack to review (usually 24-48 hours)

#### Step 3: Activate Live Mode

Once verified:

1. Go to Settings → API Keys & Webhooks
2. You will see two sets of keys:
   - **Test Keys** (for development)
   - **Live Keys** (for production)
3. Copy your Live Public Key and Live Secret Key

#### Step 4: Configure Your Application

Update your `.env` file with the live keys:

```env
PAYSTACK_PUBLIC_KEY="pk_live_your_actual_live_public_key"
PAYSTACK_SECRET_KEY="sk_live_your_actual_live_secret_key"
```

### Testing Before Going Live

Before switching to live keys, test your payment flow thoroughly:

1. Use test keys to process several test transactions
2. Verify that wallet balance updates correctly after payment
3. Test the payment popup and callback handling
4. Confirm webhook processing works (payment verification)
5. Test refund scenarios

### Paystack Fees

Paystack charges a percentage of each transaction:

- **Card payments**: 1.5% + ₦100 per transaction
- **Bank transfers**: 0.5% per transaction

Example: If a user funds ₦10,000 via card:
- Paystack fee: (₦10,000 × 1.5%) + ₦100 = ₦250
- Amount received: ₦9,750

You can choose to absorb these fees or pass them to users. Currently, your app does not add fees to the user's amount.

### Important Notes

- Live keys are sensitive. Never commit them to version control
- Always use environment variables for keys
- Test thoroughly with test keys before switching to live
- Monitor your Paystack dashboard for transaction reports
- Set up email notifications for failed transactions

---

## YouVerify Production Setup

### What is YouVerify?

YouVerify is an identity verification service that checks National Identification Numbers (NIN) against the National Identity Management Commission (NIMC) database. It confirms that a NIN is valid and returns the associated personal information.

### Current Staging Setup

Your app currently uses YouVerify sandbox environment:
- Token: `tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB`
- Base URL: `https://api.sandbox.youverify.co/v1`

The sandbox environment is free and allows unlimited testing with test NINs like `11111111111`.

### Sandbox vs Production

**Sandbox Environment:**
- Free to use
- Unlimited test requests
- Test NINs return mock data
- No real identity verification
- Perfect for development and testing

**Production Environment:**
- Requires paid subscription
- Real NIN verification against NIMC
- Charged per verification request
- Requires business verification
- Production data is accurate and official

### How to Get Production Access

#### Step 1: Create a YouVerify Account

1. Go to [youverify.co](https://youverify.co)
2. Click "Sign Up" or "Get Started"
3. Enter your business email and create an account
4. Verify your email address
5. Complete your business profile

#### Step 2: Choose a Pricing Plan

YouVerify offers flexible pricing:

- **Pay-as-you-go**: No upfront cost, pay per verification
- **Monthly subscription**: Fixed monthly fee with included verifications
- **Enterprise**: Custom pricing for high-volume users

For a new application, pay-as-you-go is recommended. You only pay when users verify their NIN.

#### Step 3: Request Production Access

1. Log in to your YouVerify dashboard
2. Go to Settings or API Configuration
3. Request production environment access
4. YouVerify will review your request (usually 24-48 hours)
5. Once approved, you will receive production API credentials

#### Step 4: Get Your Production Token

1. In your YouVerify dashboard, go to API Keys
2. You will see:
   - **Sandbox Token** (for testing)
   - **Production Token** (for live verification)
3. Copy your Production Token

#### Step 5: Configure Your Application

Update your `.env` file with production credentials:

```env
YOUVERIFY_TOKEN="your_production_token_here"
YOUVERIFY_BASE_URL="https://api.youverify.co/v2"
```

Note: The production API uses v2 endpoint, not v1.

### Testing Before Going Live

Before switching to production:

1. Keep sandbox token and URL in your staging environment
2. Test the NIN verification flow thoroughly with sandbox
3. Verify that wallet deduction and refund logic works correctly
4. Test error handling for invalid NINs
5. Confirm that verification receipts are generated properly

### YouVerify Pricing

YouVerify charges per verification request:

- **Standard verification**: ₦500 - ₦1,000 per request (varies by plan)
- **Bulk pricing**: Discounts available for high-volume users
- **No setup fees**: Free to integrate

Your app currently charges users ₦500 (50,000 kobo) per verification, which covers the YouVerify cost plus a small margin.

### Important Notes

- Production tokens are sensitive. Never commit them to version control
- Always use environment variables for tokens
- Test thoroughly with sandbox before switching to production
- Monitor your YouVerify dashboard for verification reports
- Keep track of verification costs for billing purposes

---

## Current Staging Configuration

Your application is currently configured for testing with staging tokens from both providers:

### Paystack (Test Mode)

```env
PAYSTACK_PUBLIC_KEY="pk_test_ec5ed34324eb8df91a9f02c494da3efb9ca01699"
PAYSTACK_SECRET_KEY="sk_test_37780b726b59580bca6a7084a5424622aa7054f7"
```

**What this means:**
- All payments are fake and no money changes hands
- Test card: `4111 1111 1111 1111` with any future expiry date
- Useful for testing the payment flow without real transactions
- No fees are charged

### YouVerify (Sandbox Mode)

```env
YOUVERIFY_TOKEN="tSz5ISav.pFsc05zjkd1rYj76LE6qFSDhXsFDkmjbowLB"
YOUVERIFY_BASE_URL="https://api.sandbox.youverify.co/v1"
```

**What this means:**
- All NIN verifications are against test data
- Test NIN: `11111111111` returns mock user information
- Unlimited free requests
- No real identity verification occurs
- Perfect for development and testing

### Why Use Staging First?

Staging allows you to:
- Test all features without spending money
- Verify that your code handles payments and verifications correctly
- Catch bugs before they affect real users
- Train your team on the payment and verification flow
- Build confidence in your system before going live

---

## Transition Checklist

Use this checklist when you are ready to move from staging to production:

### Pre-Production Testing (1-2 weeks)

- [ ] Test wallet funding with multiple test amounts
- [ ] Verify that wallet balance updates after payment
- [ ] Test NIN verification with sandbox token
- [ ] Verify that wallet deduction occurs for NIN verification
- [ ] Test refund logic for failed verifications
- [ ] Verify that receipts are generated correctly
- [ ] Test error handling and user-facing error messages
- [ ] Load test with multiple concurrent users
- [ ] Test on mobile devices and different browsers

### Paystack Production Setup

- [ ] Create Paystack account
- [ ] Submit business verification documents
- [ ] Wait for Paystack approval (24-48 hours)
- [ ] Obtain live API keys
- [ ] Update `.env` with live keys
- [ ] Test payment flow with live keys (small amount)
- [ ] Verify webhook processing works
- [ ] Set up email notifications in Paystack dashboard
- [ ] Document your Paystack account details securely

### YouVerify Production Setup

- [ ] Create YouVerify account
- [ ] Choose pricing plan (pay-as-you-go recommended)
- [ ] Request production environment access
- [ ] Wait for YouVerify approval (24-48 hours)
- [ ] Obtain production token
- [ ] Update `.env` with production token and v2 API URL
- [ ] Test NIN verification with production token
- [ ] Verify that costs are tracked correctly
- [ ] Document your YouVerify account details securely

### Deployment

- [ ] Deploy updated `.env` to production server
- [ ] Verify that environment variables are set correctly
- [ ] Monitor application logs for errors
- [ ] Test payment flow in production
- [ ] Test NIN verification in production
- [ ] Monitor Paystack and YouVerify dashboards
- [ ] Set up alerts for failed transactions

### Post-Launch Monitoring

- [ ] Monitor transaction success rates
- [ ] Track payment and verification costs
- [ ] Review user feedback for issues
- [ ] Monitor error logs for patterns
- [ ] Verify that receipts are being generated
- [ ] Check that wallet balances are accurate

---

## Cost Breakdown

### Monthly Cost Estimate

Assuming 100 users per month with average behavior:

**Paystack (Payment Processing)**
- Average wallet funding: ₦5,000 per user
- 100 users × ₦5,000 = ₦500,000 total
- Paystack fee (1.5% + ₦100): ₦7,500 + ₦10,000 = ₦17,500
- **Monthly Paystack cost: ₦17,500**

**YouVerify (NIN Verification)**
- Average verifications: 50 per month (50% of users verify)
- Cost per verification: ₦500 - ₦1,000 (varies by plan)
- 50 × ₦750 (average) = ₦37,500
- **Monthly YouVerify cost: ₦37,500**

**Total Monthly Cost: ₦55,000**

This is a rough estimate. Actual costs depend on:
- Number of users
- Average wallet funding amount
- Percentage of users who verify NIN
- YouVerify pricing plan chosen

### Cost Optimization

- **Paystack**: Costs are fixed percentage + fixed amount per transaction. No way to reduce.
- **YouVerify**: Consider monthly subscription plan if you have high verification volume (>100 per month)
- **Wallet fees**: You can adjust the ₦500 verification fee to cover costs and generate revenue

---

## Security Best Practices

### API Keys and Tokens

1. **Never commit keys to version control**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate keys regularly**
   - Paystack: Rotate live keys every 6 months
   - YouVerify: Rotate production token every 6 months

3. **Monitor key usage**
   - Check Paystack dashboard for unauthorized transactions
   - Check YouVerify dashboard for unusual verification patterns

4. **Secure your server**
   - Use HTTPS for all API calls
   - Keep dependencies updated
   - Monitor server logs for suspicious activity

### Payment Security

1. **Use Paystack's hosted payment page**
   - Your app already does this (Paystack popup)
   - Never handle card details directly

2. **Verify webhook signatures**
   - Paystack sends webhooks with signatures
   - Always verify the signature before processing

3. **Handle errors gracefully**
   - Never expose sensitive error details to users
   - Log errors securely for debugging

### Data Privacy

1. **Mask sensitive data**
   - Your app already masks NINs in logs and receipts
   - Never store full NIN in plain text

2. **Comply with regulations**
   - NIMC data is sensitive
   - Only store what is necessary
   - Implement data retention policies

3. **User consent**
   - Your app requires explicit consent for NIN verification
   - Keep records of consent for compliance

---

## Support and Resources

### Paystack Support

- **Documentation**: [paystack.com/docs](https://paystack.com/docs)
- **Dashboard**: [dashboard.paystack.com](https://dashboard.paystack.com)
- **Email Support**: support@paystack.com
- **Community**: Paystack Slack community

### YouVerify Support

- **Documentation**: [youverify.co/docs](https://youverify.co/docs)
- **Dashboard**: [dashboard.youverify.co](https://dashboard.youverify.co)
- **Email Support**: support@youverify.co
- **Community**: YouVerify support portal

### Your Application

- **Database**: Neon PostgreSQL (already configured)
- **Authentication**: NextAuth.js (already configured)
- **Deployment**: Vercel (recommended for Next.js)

---

## Next Steps

1. **Immediate**: Review this guide and understand the staging setup
2. **Week 1**: Create accounts with Paystack and YouVerify
3. **Week 2**: Submit verification documents and wait for approval
4. **Week 3**: Obtain production credentials and test thoroughly
5. **Week 4**: Deploy to production with live credentials

Once you have production credentials, update your `.env` file and redeploy your application. Your code is already configured to work with both staging and production environments.
