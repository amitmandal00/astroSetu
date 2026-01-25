# Monitoring Setup - Implementation Complete ✅

**Date:** December 26, 2024  
**Status:** Code implementation complete, manual setup steps required

---

## ✅ What's Been Implemented

### 1. API Quota Monitoring Endpoint ✅
**File:** `src/app/api/admin/quota-check/route.ts`

- Checks Prokerala API connectivity
- Returns API health status
- Protected with ADMIN_API_KEY authentication
- Ready for UptimeRobot monitoring

**Endpoint:** `GET /api/admin/quota-check`  
**Auth:** `Authorization: Bearer <ADMIN_API_KEY>`

---

### 2. Payment Statistics Monitoring Endpoint ✅
**File:** `src/app/api/admin/payment-stats/route.ts`

- Tracks payment success/failure rates (24 hours)
- Calculates failure percentage
- Alerts when failure rate > 5%
- Returns total amount processed
- Protected with ADMIN_API_KEY authentication

**Endpoint:** `GET /api/admin/payment-stats`  
**Auth:** `Authorization: Bearer <ADMIN_API_KEY>`

---

### 3. Comprehensive Status Endpoint ✅
**File:** `src/app/api/admin/status/route.ts`

- Checks all system components (Prokerala, Supabase, Sentry)
- Returns overall health status
- Includes uptime and response time
- Protected with ADMIN_API_KEY authentication

**Endpoint:** `GET /api/admin/status`  
**Auth:** `Authorization: Bearer <ADMIN_API_KEY>`

---

## 📋 Next Steps (Manual Setup Required)

### Step 1: Generate Admin API Key

Generate a secure random key for admin endpoints:

```bash
# Generate admin API key
openssl rand -hex 32
```

**Copy the output** - you'll need it for the next steps.

---

### Step 2: Add Environment Variable

**In Vercel Dashboard:**
1. Go to: Project → Settings → Environment Variables
2. Add new variable:
   - **Key:** `ADMIN_API_KEY`
   - **Value:** (paste the key from Step 1)
   - **Environment:** Production, Preview, Development (all)
3. Click **Save**

**For Local Development:**
Add to `.env.local`:
```bash
ADMIN_API_KEY=your-generated-key-here
```

---

### Step 3: Setup UptimeRobot Monitoring

1. **Sign up:** https://uptimerobot.com (free tier: 50 monitors)

2. **Add Main Health Monitor:**
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** "AstroSetu Health Check"
   - **URL:** `https://your-domain.vercel.app/api/health`
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Add your email
   - **Click:** Create Monitor

3. **Add Admin Status Monitor:**
   - **Monitor Type:** HTTP(s) - Keyword
   - **Friendly Name:** "AstroSetu Admin Status"
   - **URL:** `https://your-domain.vercel.app/api/admin/status`
   - **HTTP Method:** GET
   - **HTTP Headers:** `Authorization: Bearer YOUR_ADMIN_API_KEY`
   - **Keyword:** `"status":"healthy"` (or `"status":"degraded"` to alert)
   - **Monitoring Interval:** 10 minutes
   - **Alert Contacts:** Add your email
   - **Click:** Create Monitor

4. **Add Payment Stats Monitor (Optional):**
   - **Monitor Type:** HTTP(s) - Keyword
   - **Friendly Name:** "AstroSetu Payment Monitoring"
   - **URL:** `https://your-domain.vercel.app/api/admin/payment-stats`
   - **HTTP Method:** GET
   - **HTTP Headers:** `Authorization: Bearer YOUR_ADMIN_API_KEY`
   - **Keyword:** `"alert":true` (to alert on payment failures)
   - **Monitoring Interval:** 30 minutes (or hourly)
   - **Alert Contacts:** Add your email
   - **Click:** Create Monitor

---

### Step 4: Configure Sentry Alerts

1. **Login:** https://sentry.io

2. **Create Alerts:**
   - Go to: **Alerts** → **Create Alert Rule**

   **Alert 1: Error Rate Spike**
   - **Condition:** When the issue rate increases above 10 per minute
   - **Actions:** Send email notification
   - **Save**

   **Alert 2: Payment Errors**
   - **Condition:** When an issue matches: `payment OR razorpay OR transaction`
   - **Actions:** Send email + Slack (if configured)
   - **Save**

   **Alert 3: Authentication Errors**
   - **Condition:** When an issue matches: `auth OR login OR unauthorized`
   - **Actions:** Send email notification
   - **Save**

   **Alert 4: Critical Errors (500s)**
   - **Condition:** When an issue has level: Error
   - **Filter:** Status code is 500
   - **Actions:** Send email notification
   - **Save**

---

### Step 5: Test Monitoring Endpoints

Test all endpoints to ensure they work:

```bash
# Replace YOUR_ADMIN_API_KEY with your actual key
ADMIN_KEY="your-admin-api-key-here"
BASE_URL="https://your-domain.vercel.app"

# Test health check (no auth needed)
curl "$BASE_URL/api/health"

# Test admin status
curl -H "Authorization: Bearer $ADMIN_KEY" "$BASE_URL/api/admin/status"

# Test quota check
curl -H "Authorization: Bearer $ADMIN_KEY" "$BASE_URL/api/admin/quota-check"

# Test payment stats
curl -H "Authorization: Bearer $ADMIN_KEY" "$BASE_URL/api/admin/payment-stats"
```

**Expected responses:**
- All should return JSON with status information
- Health check: `{"status":"healthy",...}`
- Admin endpoints: Status JSON with various checks

---

## 🔒 Security Notes

1. **Admin API Key:**
   - Keep this key secret
   - Never commit to git (already in .gitignore)
   - Rotate periodically (every 90 days)
   - Use different keys for dev/staging/production

2. **UptimeRobot:**
   - Admin endpoints require authentication
   - Only use admin key in HTTP Headers (not URL)
   - Monitor endpoints are read-only (safe)

3. **Access Control:**
   - Admin endpoints are protected
   - Consider IP whitelisting for additional security (future enhancement)

---

## 📊 Monitoring Dashboard

Once setup is complete, you'll have monitoring for:

1. ✅ **Uptime** - Health check endpoint (5 min intervals)
2. ✅ **System Status** - Component health (10 min intervals)
3. ✅ **Payment Health** - Success/failure rates (30 min intervals)
4. ✅ **Error Tracking** - Sentry alerts on error spikes
5. ✅ **API Connectivity** - Prokerala API status checks

---

## 🎯 Expected Results

After setup completion:

- **Uptime Monitoring:** Instant alerts if app goes down
- **Error Alerts:** Notifications when errors spike
- **Payment Monitoring:** Alerts if payment failure rate > 5%
- **System Health:** Visibility into all system components
- **Proactive Management:** Issues detected before users complain

---

## 📝 Checklist

- [ ] Admin API key generated
- [ ] `ADMIN_API_KEY` added to Vercel environment variables
- [ ] `ADMIN_API_KEY` added to `.env.local` (local dev)
- [ ] UptimeRobot account created
- [ ] Health check monitor configured
- [ ] Admin status monitor configured
- [ ] Payment stats monitor configured (optional)
- [ ] Sentry alerts configured
- [ ] All endpoints tested
- [ ] Alert delivery verified

---

## 🚨 Troubleshooting

### Issue: 401 Unauthorized on admin endpoints
**Solution:** 
- Verify `ADMIN_API_KEY` is set in environment variables
- Check Authorization header format: `Bearer <key>` (with space)
- Ensure key matches exactly (no extra spaces)

### Issue: UptimeRobot shows "Down" but app works
**Solution:**
- Check URL is correct (include full path)
- Verify Authorization header is set correctly
- Check if endpoint requires authentication
- Test endpoint manually with curl

### Issue: Payment stats shows no data
**Solution:**
- Verify Supabase is configured
- Check if transactions table exists
- Ensure transactions exist in last 24 hours
- Check database connection

### Issue: Sentry alerts not working
**Solution:**
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set
- Check Sentry project is active
- Verify alert rules are saved
- Test with a manual error trigger

---

## 📈 Next Phase

Once Phase 1 is complete and verified:

- **Phase 2:** Implement circuit breaker pattern
- **Phase 3:** Add key expiration monitoring
- **Phase 4:** Enhance retry logic
- **Phase 5:** Performance monitoring

See `AUTONOMOUS_OPERATION_ASSESSMENT.md` for full roadmap.

---

**Status:** ✅ Code complete, ⏳ Manual setup steps remaining  
**Estimated Setup Time:** 1-2 hours  
**Result:** 80% autonomous operation with automatic notifications

---

**Last Updated:** December 26, 2024

