# Quick Autonomy Setup Guide

**Goal:** Achieve 80% autonomous operation in 3-4 hours  
**Cost:** $0 (using free tiers)

---

## Step 1: Setup Uptime Monitoring (30 minutes) ⚡ CRITICAL

### Option A: UptimeRobot (Recommended - Free)

1. **Sign up:** https://uptimerobot.com (free tier: 50 monitors)
2. **Add Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: "AstroSetu Health Check"
   - URL: `https://your-domain.vercel.app/api/health`
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Add your email/phone
3. **Configure Alerts:**
   - Alert when: Down
   - Alert contacts: Your email + SMS (optional)
4. **Save Monitor**

**Result:** You'll get instant alerts if the app goes down

---

### Option B: Pingdom (Alternative)

1. Sign up: https://pingdom.com
2. Add uptime check pointing to `/api/health`
3. Configure email alerts

---

## Step 2: Configure Sentry Alerts (30 minutes) ⚡ CRITICAL

Sentry is already installed, just needs alert configuration:

1. **Sign up/Login:** https://sentry.io
2. **Create Project:** If not already created
3. **Get DSN:** Copy your Sentry DSN
4. **Add to Environment Variables:**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
   SENTRY_AUTH_TOKEN=your-auth-token
   ```
5. **Configure Alerts in Sentry Dashboard:**
   - Go to: Alerts → Create Alert
   - Alert Rule: Error rate > 10 errors/minute
   - Alert Rule: Error rate spike (3x normal)
   - Alert Rule: Payment errors (filter by error message)
   - Alert Rule: Authentication errors (filter by error message)
   - Notification: Email/Slack

**Result:** You'll get alerts when errors spike or critical errors occur

---

## Step 3: API Quota Monitoring (1 hour) ⚡ HIGH PRIORITY

### Option A: Simple Script (Recommended)

Create a monitoring endpoint:

```typescript
// src/app/api/admin/quota-check/route.ts
import { NextResponse } from "next/server";
import { getAPICredentials } from "@/lib/astrologyAPI";

export async function GET(req: Request) {
  // Check authentication (add your auth logic)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Make a test API call to check quota
    const response = await fetch("https://api.prokerala.com/v2/astrology/panchang", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    // Check response headers for quota info (if available)
    const quotaUsed = response.headers.get("x-ratelimit-used");
    const quotaLimit = response.headers.get("x-ratelimit-limit");
    const quotaRemaining = response.headers.get("x-ratelimit-remaining");

    return NextResponse.json({
      quotaUsed,
      quotaLimit,
      quotaRemaining,
      percentageUsed: quotaLimit ? (quotaUsed / quotaLimit) * 100 : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check quota" }, { status: 500 });
  }
}
```

**Then setup UptimeRobot to monitor:**
- URL: `https://your-domain.vercel.app/api/admin/quota-check`
- Alert when quota > 80%

### Option B: Prokerala Dashboard (Manual Check)

1. Login to Prokerala dashboard
2. Check quota usage manually (not ideal, but better than nothing)

---

## Step 4: Payment Failure Alerts (1 hour) ⚡ HIGH PRIORITY

### Add Payment Monitoring Endpoint

```typescript
// src/app/api/admin/payment-stats/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  // Check authentication
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  
  // Get payment stats from last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("type, amount, metadata")
    .gte("created_at", yesterday.toISOString())
    .eq("type", "credit");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = transactions?.length || 0;
  const failed = transactions?.filter(t => 
    t.metadata?.status === "failed" || t.metadata?.verified === false
  ).length || 0;

  const failureRate = total > 0 ? (failed / total) * 100 : 0;

  return NextResponse.json({
    total,
    failed,
    success: total - failed,
    failureRate: `${failureRate.toFixed(2)}%`,
    alert: failureRate > 5, // Alert if > 5% failure rate
  });
}
```

**Setup UptimeRobot Alert:**
- Monitor: `https://your-domain.vercel.app/api/admin/payment-stats`
- Custom alert: If response contains `"alert": true`

---

## Step 5: Test Alert Delivery (30 minutes)

1. **Test Uptime Monitoring:**
   - Temporarily break `/api/health` endpoint
   - Wait 5 minutes
   - Verify you receive alert
   - Fix endpoint

2. **Test Sentry Alerts:**
   - Trigger a test error in Sentry dashboard
   - Verify alert email received

3. **Test Payment Monitoring:**
   - Check payment stats endpoint
   - Verify it returns correct data

---

## Quick Setup Checklist

- [ ] UptimeRobot account created
- [ ] Health check monitor configured
- [ ] Alert contacts added (email + SMS)
- [ ] Sentry alerts configured
- [ ] API quota monitoring endpoint created
- [ ] Payment stats monitoring endpoint created
- [ ] All alerts tested
- [ ] Alert delivery verified

**Time:** 3-4 hours  
**Result:** 80% autonomous operation with automatic issue notifications

---

## Post-Setup: Monthly Review

Once setup is complete, schedule monthly reviews:

1. **Review Uptime Reports** - Check for downtime patterns
2. **Review Sentry Errors** - Identify recurring issues
3. **Check API Quota Usage** - Plan for quota increases
4. **Review Payment Stats** - Ensure healthy payment processing

---

## Environment Variables Needed

Add these to Vercel Dashboard → Settings → Environment Variables:

```bash
# Sentry (if not already set)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# Admin API Key (for quota/payment monitoring)
ADMIN_API_KEY=generate-random-secret-here
```

Generate admin API key:
```bash
openssl rand -hex 32
```

---

## Next Steps After Phase 1

Once basic monitoring is in place, proceed with:
1. Circuit breaker pattern implementation
2. Key expiration monitoring
3. Enhanced retry logic
4. Performance monitoring

See `AUTONOMOUS_OPERATION_ASSESSMENT.md` for full roadmap.

---

**Last Updated:** December 26, 2024

