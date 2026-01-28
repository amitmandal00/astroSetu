# 📊 Where to Check Production Failure Logs

**Priority**: 🔴 **CRITICAL** - Essential for debugging production issues  
**Focus**: Payment failures, report generation errors, permission denied errors

---

## 🎯 **PRIMARY LOG LOCATIONS**

### **1. Vercel Logs** ⭐ **MOST IMPORTANT**

**Where**: Vercel Dashboard → Your Project → Logs

**How to Access**:
1. Go to: https://vercel.com/dashboard
2. Click on your project: `astrosetu-app`
3. Click **"Logs"** tab (top navigation)
4. Select **"Production"** environment
5. Filter by:
   - **Function**: `/api/ai-astrology/*`
   - **Status**: Errors only
   - **Time Range**: Last hour / Last day

**What to Look For**:
- ❌ **HTTP 403 errors** → Payment verification failures
- ❌ **HTTP 500 errors** → Server errors
- ❌ **Payment verification errors** → Token issues
- ❌ **Report generation timeouts** → AI/API issues
- ❌ **Stripe API errors** → Payment processing issues

**Key Search Terms**:
- `"Payment verification"`
- `"session_id"`
- `"paymentToken"`
- `"permission denied"`
- `"403"`
- `"Failed to generate report"`

**Example Query**:
```
status:error function:/api/ai-astrology/generate-report
```

---

### **2. Vercel Function Logs** (Detailed)

**Where**: Vercel Dashboard → Deployments → Latest Deployment → Functions

**How to Access**:
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **"Functions"** tab
4. Click on specific function (e.g., `api/ai-astrology/generate-report`)
5. View logs for that function

**What to Look For**:
- Function execution time
- Error stack traces
- Console.log statements
- Request/response details

---

### **3. Browser Console** (Client-Side Errors)

**How to Access**:
1. Open your production site
2. Press **F12** (or Right-click → Inspect)
3. Click **"Console"** tab
4. Look for red error messages

**What to Look For**:
- `Failed to generate report`
- `Payment verification failed`
- `403 Forbidden`
- `sessionStorage errors`
- Network request failures

**For Mobile**:
- **iOS Safari**: Use Safari Web Inspector (Mac → Safari → Develop)
- **Android Chrome**: Use Chrome DevTools → Remote debugging

---

### **4. Network Tab** (API Request Failures)

**How to Access**:
1. Open DevTools (F12)
2. Click **"Network"** tab
3. Filter by **"Fetch/XHR"**
4. Complete payment flow
5. Look for failed requests (red)

**What to Look For**:
- `/api/ai-astrology/verify-payment` → Status 403/500
- `/api/ai-astrology/generate-report` → Status 403/500
- Request payload (check if `session_id` or `paymentToken` included)
- Response body (error messages)

---

### **5. Stripe Dashboard** (Payment Logs)

**Where**: https://dashboard.stripe.com

**How to Access**:
1. Log in to Stripe Dashboard
2. Go to **"Payments"** (left sidebar)
3. Look for payment from affected user
4. Check payment status and events

**What to Look For**:
- ✅ **Payment Status**: `succeeded` / `failed` / `pending`
- ✅ **Payment Events**: Check all events timeline
- ✅ **Customer Email**: Match with user's email
- ✅ **Metadata**: Check `reportType` in metadata
- ✅ **Errors**: Any payment failures

**Key Sections**:
- **Payments** → Find payment by customer email or amount
- **Events** → View all payment events (webhooks, etc.)
- **Logs** → API request logs (if available)

---

### **6. Supabase Logs** (Database Errors)

**Where**: https://app.supabase.com

**How to Access**:
1. Log in to Supabase
2. Select your project
3. Go to **"Logs"** (left sidebar)
4. Select **"Postgres Logs"** or **"API Logs"**

**What to Look For**:
- Database query errors
- Table access errors
- `contact_submissions` insert failures
- Email audit trail logging errors

---

### **7. Resend Dashboard** (Email Failures)

**Where**: https://resend.com/emails

**How to Access**:
1. Log in to Resend Dashboard
2. Go to **"Emails"** (left sidebar)
3. Filter by date/time
4. Check delivery status

**What to Look For**:
- Email delivery failures
- Bounce rates
- Failed sends

---

## 🔍 **SPECIFIC ERROR SEARCHES**

### **Payment Verification Failures**:

**Vercel Logs Search**:
```
/api/ai-astrology/verify-payment status:error
```

**Browser Console Search**:
- Look for: `Payment verification failed`
- Look for: `403 Forbidden`
- Look for: `session_id` related errors

**Stripe Dashboard**:
- Check payment status for user
- Verify session exists in Stripe

---

### **Report Generation Failures**:

**Vercel Logs Search**:
```
/api/ai-astrology/generate-report status:error
```

**Key Error Messages**:
- `Payment verification required`
- `Invalid or expired payment token`
- `Report generation timed out`
- `AI service unavailable`

---

### **Permission Denied Errors**:

**Vercel Logs Search**:
```
status:403 function:/api/ai-astrology/generate-report
```

**Browser Console**:
- Check for `403` status codes
- Check for `permission denied` messages
- Check network requests for failed API calls

---

## 📋 **DEBUGGING CHECKLIST**

When investigating a production failure:

### **Step 1: Check Vercel Logs** (5 min)
- [ ] Open Vercel Dashboard → Logs
- [ ] Filter by Production environment
- [ ] Search for error status codes (403, 500)
- [ ] Look for relevant function: `/api/ai-astrology/*`
- [ ] Check timestamps around when user reported issue

### **Step 2: Check Stripe Dashboard** (3 min)
- [ ] Find payment for affected user
- [ ] Verify payment status: `succeeded`
- [ ] Check session metadata (reportType, etc.)
- [ ] Verify payment was processed correctly

### **Step 3: Check Browser Console** (2 min)
- [ ] Reproduce issue in browser
- [ ] Open DevTools → Console
- [ ] Look for JavaScript errors
- [ ] Check Network tab for failed API calls

### **Step 4: Check Function Logs** (5 min)
- [ ] Vercel → Deployments → Latest → Functions
- [ ] Click on specific function with error
- [ ] Review detailed logs
- [ ] Check request/response payloads

---

## 🎯 **QUICK REFERENCE - LOG LOCATIONS**

| Issue Type | Where to Check | What to Look For |
|------------|----------------|------------------|
| **Payment Failed** | Stripe Dashboard → Payments | Payment status, errors |
| **Payment Verified But Report Failed** | Vercel Logs → `/api/ai-astrology/generate-report` | 403 errors, token errors |
| **Permission Denied** | Browser Console + Vercel Logs | 403 status, "payment verification required" |
| **Report Generation Timeout** | Vercel Logs → Function logs | Timeout errors, AI API errors |
| **Token Lost** | Browser Console + Network Tab | Missing `paymentToken`, `session_id` handling |
| **Email Not Sent** | Resend Dashboard | Failed deliveries, bounces |
| **Database Errors** | Supabase Logs | Query errors, table access issues |

---

## 🔧 **HOW TO ACCESS LOGS QUICKLY**

### **Vercel Logs** (Primary):
```
https://vercel.com/dashboard
→ astrosetu-app
→ Logs tab
→ Production environment
```

### **Stripe Dashboard**:
```
https://dashboard.stripe.com
→ Payments
→ Filter by customer email or date
```

### **Browser Console**:
```
F12 → Console tab
→ Filter: "error" or "403"
```

### **Network Tab**:
```
F12 → Network tab
→ Filter: "Fetch/XHR"
→ Look for red/failed requests
```

---

## 📊 **LOGGING BEST PRACTICES**

### **What We Should Log**:

1. **Payment Verification**:
   - Session ID received
   - Token generated
   - Token regeneration attempts
   - Stripe verification results

2. **Report Generation**:
   - Payment token validation
   - Session ID fallback usage
   - Report generation start/end
   - Timeouts or errors

3. **Errors**:
   - Full error stack traces
   - Request details (session_id, reportType, etc.)
   - User context (if available)

---

## 🚨 **CRITICAL ERROR PATTERNS**

### **Pattern 1: Payment Successful But Report Fails**

**Check**:
1. Stripe Dashboard → Payment succeeded ✅
2. Vercel Logs → `/api/ai-astrology/generate-report` → 403 error
3. **Root Cause**: Token missing or invalid
4. **Fix**: Check `session_id` fallback logic

### **Pattern 2: Permission Denied After Payment**

**Check**:
1. Browser Console → 403 error on report generation
2. Network Tab → Request missing `paymentToken` or `session_id`
3. Vercel Logs → "Payment verification required"
4. **Root Cause**: Token lost, fallback not working
5. **Fix**: Verify `session_id` in URL and fallback code

### **Pattern 3: Report Generation Timeout**

**Check**:
1. Vercel Logs → Function timeout (55+ seconds)
2. Function logs → AI API hanging
3. **Root Cause**: AI service slow or unresponsive
4. **Fix**: Check OpenAI API status, implement retry logic

---

## 📝 **LOG RETENTION**

- **Vercel**: Real-time logs, limited retention (check Vercel docs)
- **Stripe**: All payment events retained
- **Supabase**: Check retention policy
- **Browser**: Only current session

**Recommendation**: Export important logs to external service if needed for compliance

---

## 🔗 **QUICK LINKS**

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Supabase Dashboard**: https://app.supabase.com
- **Resend Dashboard**: https://resend.com/emails

---

**Last Updated**: January 6, 2026  
**Priority**: 🔴 **CRITICAL** - Essential for Production Debugging

