# Timeout Fixes Monitoring Plan

**Date:** 2026-01-22  
**Status:** Active Monitoring

---

## What Was Fixed

1. ✅ Reduced OpenAI client timeout: 110s/55s → 25s
2. ✅ Route timeout: 30s (consistent)
3. ✅ Improved Promise.race error handling
4. ✅ Added abort signal checks
5. ✅ Reduced retry wait times

---

## Monitoring Checklist

### Day 1-2 (Critical Period)

**Monitor Vercel Logs for:**

1. **504 Errors**
   - Search: `"504"` or `"REPORT GENERATION TIMEOUT"`
   - Expected: Should see ZERO 504 errors
   - If found: Note report type, timestamp, requestId

2. **Timeout Errors**
   - Search: `"timed out"` or `"timeout"`
   - Expected: Should see timeout errors at 25-30s (not 60s/120s)
   - If found: Verify they're caught and handled gracefully

3. **Successful Completions**
   - Search: `"GENERATION_SUCCESS"` or `"status: DELIVERED"`
   - Expected: Most reports complete within 30s
   - Track: Average completion time

4. **Abort Signal Triggers**
   - Search: `"Request aborted due to timeout"`
   - Expected: Should see these when timeout triggers
   - Verify: Reports are marked as failed, not stuck in processing

---

## Success Metrics

### ✅ Success Criteria (After 48 hours)

1. **Zero 504 errors** from Vercel
2. **< 5% timeout rate** (timeouts should be rare)
3. **Average completion time < 25s** for most reports
4. **No reports stuck in "processing"** status

### ⚠️ Warning Signs

1. **504 errors persist** → Timeout fix didn't work, need async generation
2. **High timeout rate (>10%)** → OpenAI is consistently slow, may need longer timeout
3. **Reports stuck in processing** → Abort signal not working, need to fix cleanup

---

## Log Queries for Vercel

### Check for 504 Errors
```
status:504 OR "REPORT GENERATION TIMEOUT"
```

### Check for Timeout Errors
```
"timed out" OR "timeout" OR "Request aborted due to timeout"
```

### Check Success Rate
```
"GENERATION_SUCCESS" OR "status: DELIVERED"
```

### Check Average Completion Time
```
"elapsedMs" OR "totalTimeMs"
```

---

## Action Plan Based on Results

### If 504 Errors Persist
- **Action:** Implement async generation (Priority 1)
- **Timeline:** 2-3 days
- **Impact:** High (eliminates timeout issues completely)

### If Timeout Rate > 10%
- **Action:** Increase OpenAI timeout to 35-40s (still < route timeout)
- **Timeline:** 1 hour
- **Impact:** Medium (may help, but async is better long-term)

### If Reports Stuck in Processing
- **Action:** Fix abort signal cleanup
- **Timeline:** 2-3 hours
- **Impact:** High (prevents stuck states)

### If All Metrics Good
- **Action:** Continue monitoring, document success
- **Timeline:** Ongoing
- **Impact:** Low (maintain status quo)

---

## Monitoring Schedule

- **Hour 1-6:** Check every hour
- **Hour 6-24:** Check every 4 hours
- **Day 2-7:** Check daily
- **Week 2+:** Check weekly

---

## Reporting Template

```
Date: [DATE]
Time Period: [START] - [END]

Metrics:
- 504 Errors: [COUNT]
- Timeout Errors: [COUNT]
- Successful Completions: [COUNT]
- Average Completion Time: [SECONDS]
- Reports Stuck in Processing: [COUNT]

Status: ✅ PASS / ⚠️ WARNING / ❌ FAIL

Notes:
[ANY OBSERVATIONS]
```

---

**Next Review:** 24 hours after deployment

