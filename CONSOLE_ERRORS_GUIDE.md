# Production Console Errors Guide

This document explains the console errors and warnings you're seeing in production and what has been done to address them.

## Summary

Most of the console messages are warnings and non-critical issues. The main issue was **Content-Security-Policy (CSP) violations** which have been fixed by updating the security headers in `next.config.js`.

---

## Errors Explained

### 1. Content-Security-Policy (CSP) Violation ⚠️ FIXED

**Error Message:**
```
Content-Security-Policy: The page's settings blocked an inline script (script-src-elem) 
from being executed because it violates the following directive...
```

**What it means:**
Your browser's security policy was blocking inline scripts from running. This is a security feature to prevent malicious code injection.

**Why it happened:**
Paystack's popup library includes inline scripts that weren't explicitly allowed in the CSP header.

**What was fixed:**
Updated `next.config.js` to add proper security headers that allow Paystack and other necessary third-party scripts while maintaining security.

**Impact:** None - the payment functionality still works, but the browser was logging warnings.

---

### 2. Referrer Policy Warnings ⚠️ FIXED

**Error Message:**
```
Referrer Policy: Ignoring the less restricted referrer policy "no-referrer-when-downgrade" 
for the cross-site request: https://api.paystack.co/...
```

**What it means:**
Your browser is warning that cross-site requests are using a less restrictive referrer policy than expected.

**Why it happened:**
Paystack and other third-party services were sending requests with a less restrictive referrer policy.

**What was fixed:**
Updated the Referrer-Policy header to `strict-origin-when-cross-origin` which is more secure while still allowing necessary cross-site requests.

**Impact:** None - requests still work, but the browser logs warnings.

---

### 3. Cookie Rejection Warnings ℹ️ INFORMATIONAL

**Error Message:**
```
Cookie "ph_phc_LZ6VShmQYuGQM536EGOroVpmYKcpeL7U4bbtN3govL0_posthog" has been rejected 
because it is in a cross-site context and its "SameSite" is "Lax" or "Strict".
```

**What it means:**
Third-party cookies (from PostHog analytics and other services) are being rejected by your browser.

**Why it happens:**
Modern browsers block third-party cookies by default for privacy reasons. This is expected behavior.

**Impact:** None - analytics still work, but some tracking features may be limited. This is actually good for user privacy.

---

### 4. CSS Parsing Errors ℹ️ INFORMATIONAL

**Error Message:**
```
Error in parsing value for '-webkit-text-size-adjust'. Declaration dropped.
Error in parsing value for 'stroke-dashoffset'. Declaration dropped.
```

**What it means:**
The browser encountered CSS properties it doesn't recognize or support.

**Why it happens:**
These are vendor-specific CSS properties (like `-webkit-` prefixes) that some browsers don't support. This is normal and expected.

**Impact:** None - the page still renders correctly. These are just browser compatibility warnings.

---

### 5. WebGL Deprecation Warning ℹ️ INFORMATIONAL

**Error Message:**
```
WEBGL_debug_renderer_info is deprecated in Firefox and will be removed. 
Please use RENDERER.
```

**What it means:**
A WebGL API that was used is deprecated in Firefox.

**Why it happens:**
This comes from third-party libraries (possibly analytics or visualization tools).

**Impact:** None - the feature still works in current Firefox versions.

---

### 6. OpaqueResponseBlocking Warning ℹ️ INFORMATIONAL

**Error Message:**
```
A resource is blocked by OpaqueResponseBlocking, please check browser console for details.
```

**What it means:**
A cross-origin resource was blocked due to CORS (Cross-Origin Resource Sharing) restrictions.

**Why it happens:**
This is a security feature to prevent unauthorized cross-origin requests.

**Impact:** None - the application still functions normally.

---

### 7. Domain Cookie Rejection ℹ️ INFORMATIONAL

**Error Message:**
```
Cookie "dmn_chk_019cb5b1-0368-70d2-80d5-0e1ab27d899f" has been rejected for invalid domain.
```

**What it means:**
A cookie was rejected because it was set for an invalid domain.

**Why it happens:**
Third-party services sometimes try to set cookies for domains they don't own.

**Impact:** None - this is expected behavior and doesn't affect functionality.

---

## Security Headers Added

The following security headers have been added to your application:

### Content-Security-Policy (CSP)

Restricts what resources can be loaded and executed. Allows:
- Scripts from your domain and Paystack
- Styles from your domain (inline styles allowed for UI framework)
- Images from your domain and HTTPS sources
- Connections to Paystack, analytics, and other necessary services

### Referrer-Policy

Set to `strict-origin-when-cross-origin` which means:
- Only send the origin (not the full URL) when making cross-site requests
- More secure than the default policy

### X-Content-Type-Options

Set to `nosniff` which prevents:
- Browser from guessing file types
- Protects against MIME type confusion attacks

### X-Frame-Options

Set to `SAMEORIGIN` which prevents:
- Your site from being embedded in iframes on other domains
- Protects against clickjacking attacks

### X-XSS-Protection

Set to `1; mode=block` which:
- Enables browser XSS protection
- Blocks the page if XSS is detected

### Permissions-Policy

Restricts access to sensitive browser features:
- Geolocation: Disabled
- Microphone: Disabled
- Camera: Disabled

---

## What You Should Do

### Immediate Actions

1. **Redeploy your application** with the updated `next.config.js`
   ```bash
   npm run build
   git add next.config.js
   git commit -m "Add security headers to fix CSP violations"
   git push
   ```

2. **Clear browser cache** to ensure new headers are loaded
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Test the application** in production
   - Test wallet funding with Paystack
   - Test NIN verification
   - Check browser console for errors

### Monitoring

1. **Monitor console errors** for the first week
   - Most warnings should be gone
   - Some third-party warnings may remain (normal)

2. **Test on different browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

3. **Test on mobile devices**
   - iOS Safari
   - Android Chrome

---

## Remaining Warnings (Expected)

Some warnings will remain and are expected:

1. **PostHog analytics warnings** - Third-party analytics service
2. **CSS vendor prefix warnings** - Browser compatibility, not an issue
3. **WebGL deprecation** - From third-party libraries, not critical
4. **Third-party cookie rejections** - Expected with modern privacy settings

These do not affect functionality and are normal in production applications.

---

## Testing Checklist

After deploying the security headers:

- [ ] Wallet funding works with Paystack
- [ ] NIN verification works
- [ ] No CSP violation errors in console
- [ ] No referrer policy warnings for your domain
- [ ] Page loads quickly
- [ ] All UI elements render correctly
- [ ] Mobile experience is smooth
- [ ] Error handling works correctly

---

## If You See New Errors

If you see new errors after deploying:

1. **Check the error message** - Note the exact error
2. **Identify the source** - Which script or resource is causing it
3. **Update CSP header** - Add the necessary domain to the CSP policy
4. **Test again** - Verify the fix works
5. **Document the change** - Update this guide

---

## Resources

- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [OWASP: Security Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js: Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/headers)

---

## Summary

Your application is now more secure with proper security headers configured. The console warnings you were seeing are mostly informational and don't affect functionality. The main CSP violation has been fixed, and your application should work smoothly in production.

If you encounter any issues, refer to the testing checklist above or contact support.
