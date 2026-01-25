# Stale Reports Background Job

**Date:** 2026-01-21  
**Status:** ✅ Implemented

---

## Overview

Background job to automatically process stale reports (stuck in "processing" status > 5 minutes) and auto-refund payments to prevent chargebacks.

**CRITICAL:** This addresses ChatGPT's Risk 1 (Payment Taken But Report Fails) by ensuring stuck reports are automatically refunded.

---

## Implementation

### 1. Database Function

**File:** `src/lib/ai-astrology/reportStore.ts`

**Function:** `getStaleProcessingReports(thresholdMinutes: number = 5)`

**Purpose:** Query reports in "processing" status that haven't been updated in > threshold minutes.

**Query Logic:**
- Status = "processing"
- `updated_at` < (now - thresholdMinutes)
- Ordered by `updated_at` (oldest first)

---

### 2. Background Job Endpoint

**File:** `src/app/api/ai-astrology/process-stale-reports/route.ts`

**Endpoint:** `POST /api/ai-astrology/process-stale-reports`

**Features:**
- ✅ Security: API key or Vercel cron authentication
- ✅ Auto-refund: Checks if payment was captured and refunds if needed
- ✅ Mark as failed: Updates report status to "failed" with error code "STALE_PROCESSING"
- ✅ Monitoring: Logs to Sentry for alerts
- ✅ Error handling: Continues processing other reports if one fails

**Query Parameters:**
- `threshold` (optional): Minutes since last update to consider stale (default: 5)

**Response:**
```json
{
  "ok": true,
  "data": {
    "processed": 2,
    "refunded": 1,
    "failed": 0,
    "errors": [],
    "thresholdMinutes": 5
  },
  "requestId": "..."
}
```

---

### 3. Vercel Cron Configuration

**File:** `vercel.json`

**Schedule:** Every 5 minutes (`*/5 * * * *`)

**Configuration:**
```json
{
  "crons": [
    {
      "path": "/api/ai-astrology/process-stale-reports",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Note:** Vercel cron jobs automatically add `Authorization: Bearer ${CRON_SECRET}` header.

---

### 4. Monitoring & Alerts

**Sentry Integration:**
- Alerts when > 10 stale reports detected (potential issue)
- Alerts on refund failures (critical - user may be charged)
- Alerts on processing failures

**Logging:**
- Structured logs with request IDs
- Error context for debugging
- Summary statistics

---

## Security

### Authentication

1. **API Key** (Recommended for production):
   - Set `STALE_REPORTS_API_KEY` environment variable
   - Send `x-api-key` header with requests
   - Required if API key is set

2. **Vercel Cron** (Automatic):
   - Vercel automatically adds `Authorization: Bearer ${CRON_SECRET}` header
   - Works automatically when deployed

3. **Development Mode**:
   - Allows internal access if no API key is set
   - Only for local development

---

## Refund Logic

### Payment States

1. **`requires_capture`** (Authorized but not captured):
   - Cancel payment intent (no refund needed)
   - Mark as refunded in database

2. **`succeeded`** (Payment captured):
   - Find associated charge
   - Create refund via Stripe
   - Mark as refunded in database

3. **Already refunded**:
   - Skip refund, mark as already refunded

### Error Handling

- Refund failures are logged but don't block other reports
- Errors are sent to Sentry for alerts
- Manual intervention may be required for refund failures

---

## Usage

### Manual Trigger (for testing)

```bash
# With API key
curl -X POST https://your-domain.com/api/ai-astrology/process-stale-reports \
  -H "x-api-key: your-api-key"

# With custom threshold
curl -X POST "https://your-domain.com/api/ai-astrology/process-stale-reports?threshold=10" \
  -H "x-api-key: your-api-key"
```

### Vercel Cron (Automatic)

Automatically runs every 5 minutes when deployed to Vercel.

---

## Environment Variables

### Required

- `STRIPE_SECRET_KEY` - For refund processing
- `SUPABASE_URL` - For database access
- `SUPABASE_SERVICE_ROLE_KEY` - For database access

### Optional

- `STALE_REPORTS_API_KEY` - API key for manual triggers (recommended for production)
  - **Setup Guide:** See `VERCEL_ENV_SETUP_GUIDE.md` for detailed instructions
  - **Generate:** `openssl rand -hex 32` (32+ characters recommended)
- `CRON_SECRET` - Vercel cron secret (automatically set by Vercel)
- `NEXT_PUBLIC_SENTRY_DSN` - For Sentry error tracking

---

## Testing

### Unit Tests

**File:** `tests/integration/stale-reports-job.test.ts`

**Coverage:**
- ✅ Query logic for stale reports
- ✅ Mark as failed functionality
- ✅ Custom threshold handling

### Manual Testing

1. Create a test report in "processing" status
2. Set `updated_at` to > 5 minutes ago
3. Trigger the job manually
4. Verify report is marked as failed
5. Verify refund is processed (if payment was captured)

---

## Monitoring

### Key Metrics

1. **Stale Report Count**: Number of reports stuck in processing
2. **Refund Success Rate**: Percentage of refunds that succeed
3. **Processing Failures**: Number of reports that fail to process

### Alerts

- **High Stale Count**: > 10 stale reports (potential systemic issue)
- **Refund Failures**: Any refund failure (critical - user may be charged)
- **Processing Failures**: Reports that fail to process

### Logs

All actions are logged with:
- Request ID
- Report ID
- Payment Intent ID (if applicable)
- Error details (if any)

---

## Error Codes

**New Error Code:** `STALE_PROCESSING`

Added to `ReportErrorCode` type in `reportStore.ts`:
- Used when report is stuck in processing > threshold
- Helps track and analyze stale report patterns

---

## Integration with Existing Systems

### Report Store

- Uses existing `getStaleProcessingReports()` function
- Uses existing `markStoredReportFailed()` function
- Uses existing `markStoredReportRefunded()` function

### Payment System

- Uses existing `cancel-payment` endpoint logic
- Reuses Stripe refund logic from `cancel-payment/route.ts`
- Maintains consistency with existing refund flow

### Monitoring

- Integrates with Sentry (if configured)
- Uses existing logging patterns
- Follows existing error handling conventions

---

## Future Enhancements

### Potential Improvements

1. **Background Completion**: Queue timed-out reports for background retry
2. **Cost Tracking**: Log OpenAI costs per report for analysis
3. **Metrics Dashboard**: Visual dashboard for stale report trends
4. **Custom Thresholds**: Per-report-type thresholds (year-analysis might need longer)

### Not Required (Per ChatGPT)

- Perfectionism (current implementation is sufficient)
- Infinite retries (single attempt is correct)
- Hard validation gates (soft validation is correct)

---

## Risk Mitigation

### Before Implementation

- ❌ Stuck reports could remain in "processing" indefinitely
- ❌ Users could be charged for failed reports
- ❌ No automatic refund for stuck reports

### After Implementation

- ✅ Stuck reports automatically detected and processed
- ✅ Automatic refund prevents chargebacks
- ✅ Monitoring alerts catch issues early
- ✅ Reduces founder mental load (automated)

---

## Deployment Checklist

- [ ] Set `STALE_REPORTS_API_KEY` in Vercel environment variables
  - **Guide:** See `VERCEL_ENV_SETUP_GUIDE.md` for step-by-step instructions
  - **Quick:** Vercel Dashboard → Settings → Environment Variables → Add `STALE_REPORTS_API_KEY`
  - **Generate Key:** `openssl rand -hex 32`
- [ ] Verify `vercel.json` cron configuration is correct
- [ ] Test endpoint manually after deployment (with API key)
- [ ] Verify Sentry alerts are working
- [ ] Monitor first few cron runs for issues
- [ ] Document API key for manual triggers (if needed)

---

## Summary

**Status:** ✅ **IMPLEMENTED**

**Risk Level:** 🟢 **LOW** (after implementation)

**Key Benefits:**
- Prevents chargebacks from stuck reports
- Automatic refund processing
- Monitoring and alerts
- Reduces manual intervention

**Next Steps:**
1. Deploy to production
2. Monitor first few runs
3. Adjust threshold if needed (based on production data)
4. Consider background completion for timed-out reports (Priority 2)

---

**Implementation Complete:** 2026-01-21

