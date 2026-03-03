# Production Deployment Checklist

Use this checklist to ensure your application is ready for production deployment. Complete all items before deploying to production.

## Pre-Deployment Phase (1-2 weeks before launch)

### Code Quality

- [ ] Run `npm run build` and verify no errors
- [ ] Run `npm run lint` and fix all warnings
- [ ] Review all recent code changes
- [ ] Remove any console.log statements from production code
- [ ] Remove any TODO or FIXME comments that are not addressed
- [ ] Verify all error handling is in place
- [ ] Check that sensitive data is not logged anywhere
- [ ] Review security best practices in code

### Testing

- [ ] Test wallet funding with multiple amounts (₦500, ₦1,000, ₦10,000)
- [ ] Test NIN verification with valid test NIN (11111111111)
- [ ] Test NIN verification with invalid NIN
- [ ] Test wallet refund logic for failed verifications
- [ ] Test user registration and login flow
- [ ] Test dashboard and transaction history
- [ ] Test receipt generation and download
- [ ] Test on mobile devices (iOS and Android)
- [ ] Test on different browsers (Chrome, Safari, Firefox, Edge)
- [ ] Test with slow internet connection (throttle to 3G)
- [ ] Test with offline mode (verify error handling)
- [ ] Load test with 10+ concurrent users
- [ ] Test error scenarios (network timeout, API errors, etc.)

### Database

- [ ] Verify database schema is correct
- [ ] Run all migrations successfully
- [ ] Backup current database
- [ ] Test database connection from production environment
- [ ] Verify database has sufficient storage
- [ ] Set up automated backups
- [ ] Test backup and restore process
- [ ] Verify database performance with expected data volume

### Security

- [ ] Generate new `AUTH_SECRET` for production
- [ ] Verify all API keys are correct (Paystack, YouVerify)
- [ ] Verify database credentials are secure
- [ ] Enable HTTPS on all endpoints
- [ ] Set up SSL certificate (if not using managed hosting)
- [ ] Configure CORS properly (only allow your domain)
- [ ] Verify no sensitive data in error messages
- [ ] Review authentication and authorization logic
- [ ] Test that unauthenticated users cannot access protected routes
- [ ] Verify that users can only access their own data

### Performance

- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets (if needed)
- [ ] Verify database queries are optimized
- [ ] Check that API responses are fast (<500ms)
- [ ] Verify that page load time is acceptable (<3s)
- [ ] Set up monitoring and alerting

### Documentation

- [ ] Review PRODUCTION_SETUP.md
- [ ] Review ENVIRONMENT_VARIABLES.md
- [ ] Update README.md with production information
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

---

## Paystack Production Setup (1 week before launch)

### Account Setup

- [ ] Create Paystack account at [paystack.com](https://paystack.com)
- [ ] Verify email address
- [ ] Complete business profile
- [ ] Upload business registration certificate
- [ ] Upload valid government-issued ID
- [ ] Upload proof of address (utility bill or bank statement)
- [ ] Wait for Paystack verification (24-48 hours)

### API Configuration

- [ ] Log in to Paystack dashboard
- [ ] Go to Settings → API Keys & Webhooks
- [ ] Copy Live Public Key
- [ ] Copy Live Secret Key
- [ ] Verify keys are correct (should start with `pk_live_` and `sk_live_`)
- [ ] Set up webhook URL in Paystack dashboard
- [ ] Webhook URL should be: `https://yourdomain.com/api/paystack/webhook`
- [ ] Test webhook delivery from Paystack dashboard

### Testing

- [ ] Test payment initialization with live keys
- [ ] Process a small test payment (₦100 or ₦500)
- [ ] Verify payment appears in Paystack dashboard
- [ ] Verify webhook is received and processed
- [ ] Verify wallet balance is updated correctly
- [ ] Test payment failure scenario
- [ ] Test payment cancellation
- [ ] Verify error messages are user-friendly

### Monitoring

- [ ] Set up email notifications in Paystack dashboard
- [ ] Enable notifications for failed transactions
- [ ] Enable notifications for successful transactions
- [ ] Set up dashboard alerts for unusual activity
- [ ] Document Paystack support contact information

---

## YouVerify Production Setup (1 week before launch)

### Account Setup

- [ ] Create YouVerify account at [youverify.co](https://youverify.co)
- [ ] Verify email address
- [ ] Complete business profile
- [ ] Choose pricing plan (pay-as-you-go recommended)
- [ ] Request production environment access
- [ ] Wait for YouVerify approval (24-48 hours)

### API Configuration

- [ ] Log in to YouVerify dashboard
- [ ] Go to API Keys or Settings
- [ ] Copy Production Token
- [ ] Verify token is correct (should not start with `test_`)
- [ ] Update application configuration with production token
- [ ] Update API base URL to production: `https://api.youverify.co/v2`

### Testing

- [ ] Test NIN verification with production token
- [ ] Verify with a real NIN (if available)
- [ ] Verify response includes all expected fields
- [ ] Test error handling for invalid NIN
- [ ] Verify wallet deduction occurs correctly
- [ ] Verify refund logic works for failed verifications
- [ ] Test with multiple concurrent requests
- [ ] Verify costs are tracked correctly

### Monitoring

- [ ] Set up email notifications in YouVerify dashboard
- [ ] Enable notifications for verification failures
- [ ] Set up dashboard alerts for unusual activity
- [ ] Document YouVerify support contact information
- [ ] Set up cost tracking and alerts

---

## Environment Configuration (Day before launch)

### Environment Variables

- [ ] Update `DATABASE_URL` with production database
- [ ] Update `AUTH_SECRET` with new production secret
- [ ] Update `PAYSTACK_PUBLIC_KEY` with live key
- [ ] Update `PAYSTACK_SECRET_KEY` with live key
- [ ] Update `YOUVERIFY_TOKEN` with production token
- [ ] Update `YOUVERIFY_BASE_URL` to production endpoint
- [ ] Verify all variables are set correctly
- [ ] Verify no test keys are in production

### Deployment Platform

- [ ] Set environment variables in hosting platform (Vercel, etc.)
- [ ] Verify variables are set for Production environment
- [ ] Verify variables are NOT set for Preview/Staging
- [ ] Test that application can read all variables
- [ ] Verify database connection works
- [ ] Verify Paystack connection works
- [ ] Verify YouVerify connection works

### DNS and Domain

- [ ] Verify domain is pointing to production server
- [ ] Verify SSL certificate is valid
- [ ] Test HTTPS connection
- [ ] Verify no mixed content warnings
- [ ] Set up email for domain (if needed)

---

## Deployment Day

### Pre-Deployment

- [ ] Create backup of current production database
- [ ] Notify team that deployment is starting
- [ ] Prepare rollback plan
- [ ] Have support team on standby
- [ ] Verify all team members know the rollback procedure

### Deployment

- [ ] Deploy application to production
- [ ] Verify deployment completed successfully
- [ ] Check application logs for errors
- [ ] Verify all pages load correctly
- [ ] Test login functionality
- [ ] Test wallet funding flow
- [ ] Test NIN verification flow
- [ ] Verify database is accessible
- [ ] Verify Paystack integration works
- [ ] Verify YouVerify integration works

### Post-Deployment

- [ ] Monitor application logs for errors
- [ ] Monitor Paystack dashboard for transactions
- [ ] Monitor YouVerify dashboard for verifications
- [ ] Check error tracking service (if configured)
- [ ] Verify email notifications are working
- [ ] Test with real users (if available)
- [ ] Gather feedback from early users
- [ ] Document any issues encountered

---

## Post-Launch Monitoring (First week)

### Daily Checks

- [ ] Check application logs for errors
- [ ] Check Paystack dashboard for failed transactions
- [ ] Check YouVerify dashboard for failed verifications
- [ ] Monitor database performance
- [ ] Monitor server resource usage (CPU, memory, disk)
- [ ] Check error tracking service for new issues
- [ ] Review user feedback and support tickets

### Weekly Checks

- [ ] Review transaction success rates
- [ ] Review verification success rates
- [ ] Analyze user behavior and usage patterns
- [ ] Check for any security issues
- [ ] Review performance metrics
- [ ] Update documentation based on learnings
- [ ] Plan for any necessary improvements

### Ongoing Monitoring

- [ ] Set up automated alerts for errors
- [ ] Set up automated alerts for performance issues
- [ ] Monitor transaction costs
- [ ] Monitor verification costs
- [ ] Review logs weekly for patterns
- [ ] Update security measures as needed
- [ ] Keep dependencies updated
- [ ] Plan for scaling if needed

---

## Rollback Procedure

If something goes wrong after deployment, follow this procedure:

### Immediate Actions

1. [ ] Notify all team members
2. [ ] Stop accepting new transactions (if critical issue)
3. [ ] Assess the severity of the issue
4. [ ] Decide whether to rollback or fix forward

### Rollback Steps

1. [ ] Revert to previous application version
2. [ ] Revert environment variables to previous values (if changed)
3. [ ] Verify application is working
4. [ ] Verify database is accessible
5. [ ] Verify Paystack integration works
6. [ ] Verify YouVerify integration works
7. [ ] Notify users of the issue
8. [ ] Document what went wrong

### Post-Rollback

1. [ ] Investigate root cause of the issue
2. [ ] Fix the issue in development
3. [ ] Test thoroughly before re-deploying
4. [ ] Plan for re-deployment
5. [ ] Document lessons learned

---

## Common Issues and Solutions

### Issue: "We're having trouble talking to our database"

**Cause**: Database connection failed

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check that database server is running
3. Verify network connectivity to database
4. Check database credentials
5. Review database logs for errors

### Issue: Payment initialization fails

**Cause**: Paystack API error

**Solution**:
1. Verify `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` are correct
2. Check that keys are live keys (not test keys)
3. Verify Paystack account is active
4. Check Paystack dashboard for account issues
5. Review API logs for errors

### Issue: NIN verification fails

**Cause**: YouVerify API error

**Solution**:
1. Verify `YOUVERIFY_TOKEN` is correct
2. Check that token is production token (not sandbox)
3. Verify YouVerify account is active
4. Check YouVerify dashboard for account issues
5. Review API logs for errors

### Issue: High error rate after deployment

**Cause**: Possible code issue or configuration problem

**Solution**:
1. Check application logs for error patterns
2. Verify all environment variables are set correctly
3. Check database performance
4. Review recent code changes
5. Consider rollback if issue is critical

---

## Success Criteria

Your deployment is successful when:

- [ ] Application loads without errors
- [ ] Users can register and log in
- [ ] Users can fund wallet with Paystack
- [ ] Users can verify NIN with YouVerify
- [ ] Wallet balance updates correctly
- [ ] Receipts are generated correctly
- [ ] Error messages are user-friendly
- [ ] No sensitive data is exposed
- [ ] Performance is acceptable (<3s page load)
- [ ] All monitoring and alerts are working
- [ ] Support team is trained and ready
- [ ] Documentation is complete and accurate

---

## Contact Information

### Support Contacts

- **Paystack Support**: support@paystack.com
- **YouVerify Support**: support@youverify.co
- **Database Support**: [Your database provider]
- **Hosting Support**: [Your hosting provider]

### Internal Contacts

- **Development Lead**: [Name and contact]
- **DevOps Lead**: [Name and contact]
- **Product Manager**: [Name and contact]
- **Support Manager**: [Name and contact]

---

## Additional Resources

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Detailed setup guide
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment variable reference
- [README.md](./README.md) - Project overview
- [Paystack Documentation](https://paystack.com/docs)
- [YouVerify Documentation](https://youverify.co/docs)
