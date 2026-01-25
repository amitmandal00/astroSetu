# External Cron Setup (Alternative to Vercel Cron)

**Why:** Vercel cron jobs require a Pro plan. If you're on Free/Hobby plan, use an external cron service instead.

---

## Quick Setup

### Option 1: cron-job.org (Free)

1. **Sign up:** https://cron-job.org (free account)
2. **Create cron job:**
   - **Title:** Stale Reports Background Job
   - **URL:** `https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-stale-reports`
   - **Schedule:** Every 5 minutes (`*/5 * * * *`)
   - **Request Method:** POST
   - **Request Headers:**
     - `Content-Type: application/json`
     - `x-api-key: YOUR_STALE_REPORTS_API_KEY` (if you set one)
   - **Save**

3. **Test:**
   - Click "Run now" to test
   - Check Vercel logs to verify it worked

---

## ALSO Recommended: Heavy Report Queue Worker (Async)

Heavy reports (`full-life`, `career-money`, `major-life-phase`, `decision-support`) are queued and processed by a worker endpoint.

### Worker Endpoint

- **URL:** `https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-report-queue`
- **Schedule:** Every 1 minute (`*/1 * * * *`) or every 2 minutes (`*/2 * * * *`)
- **Request Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
  - `x-api-key: YOUR_REPORT_QUEUE_API_KEY`

See `ASYNC_HEAVY_REPORTS.md` for details.

### Option 2: EasyCron (Free tier available)

1. **Sign up:** https://www.easycron.com
2. **Create cron job:**
   - **Cron Job Title:** Stale Reports Job
   - **URL:** `https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-stale-reports`
   - **Schedule:** `*/5 * * * *` (every 5 minutes)
   - **HTTP Method:** POST
   - **HTTP Headers:** 
     ```
     Content-Type: application/json
     x-api-key: YOUR_STALE_REPORTS_API_KEY
     ```
   - **Save**

### Option 3: GitHub Actions (Free)

Create `.github/workflows/stale-reports-cron.yml`:

```yaml
name: Process Stale Reports

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  process-stale-reports:
    runs-on: ubuntu-latest
    steps:
      - name: Call Stale Reports Endpoint
        run: |
          curl -X POST https://${{ secrets.VERCEL_DOMAIN }}/api/ai-astrology/process-stale-reports \
            -H "x-api-key: ${{ secrets.STALE_REPORTS_API_KEY }}" \
            -H "Content-Type: application/json"
```

**Setup:**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VERCEL_DOMAIN`: Your Vercel domain (e.g., `your-app.vercel.app`)
   - `STALE_REPORTS_API_KEY`: Your API key (if set)

---

## Recommended: cron-job.org

**Why:**
- ✅ Free tier available
- ✅ Easy to set up
- ✅ Good monitoring/alerting
- ✅ Reliable

**Setup Steps:**
1. Sign up at https://cron-job.org
2. Create new cron job
3. Set URL to your endpoint
4. Set schedule to every 5 minutes
5. Add API key header (if using)
6. Save and test

---

## Verify It's Working

1. **Test manually:**
   ```bash
   curl -X POST https://YOUR_DOMAIN/api/ai-astrology/process-stale-reports \
     -H "x-api-key: YOUR_API_KEY"
   ```

2. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter by `/api/ai-astrology/process-stale-reports`
   - Should see requests every 5 minutes

3. **Check cron service logs:**
   - Most services show execution history
   - Verify successful requests (200 status)

---

## Benefits of External Cron

- ✅ Works on any Vercel plan (Free/Hobby/Pro)
- ✅ Better monitoring/alerting
- ✅ More control over scheduling
- ✅ Can pause/resume easily
- ✅ Execution history/logs

---

## Note

The `crons` section was removed from `vercel.json` to restore auto-deployment. Use external cron service instead.

