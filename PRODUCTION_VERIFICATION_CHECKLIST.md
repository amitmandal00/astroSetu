# Production Verification Checklist

**Date**: 2026-01-17 18:00  
**Status**: Code ready; awaiting real-runner verification

---

## Pre-Deployment Verification

### 1. Real-Runner Build Test (REQUIRED)
**Status**: ⏸️ Pending

Run `npm run release:gate` in one of:
- ✅ Vercel build (recommended)
- ✅ GitHub Actions CI
- ✅ Local machine (outside sandbox)

**Expected**: All gates pass (type-check ✅, build ✅, test:critical ✅)

**Once green**: EPERM issue is conclusively irrelevant; fix is provably production-ready

---

## Post-Deployment Verification (Incognito Test)

After deployment, verify in **fresh Incognito browser**:

### Test 1: Year-Analysis Auto-Generate
1. Navigate to: `/ai-astrology/preview?session_id=...&reportType=year-analysis&auto_generate=true`
2. **Check logs** (Vercel/console):
   - ✅ Exactly **one** `[AUTOSTART]` log entry
   - ✅ Log shows: `attemptKey=... reportType=year-analysis sessionId=... autoGenerate=true`
3. **Verify behavior**:
   - ✅ Controller leaves `idle` immediately (within 1s)
   - ✅ Timer starts and is monotonic (never resets to 0)
   - ✅ Report completes OR shows Retry button (within 120s)
   - ✅ No infinite spinner

### Test 2: Full-Life Auto-Generate
1. Navigate to: `/ai-astrology/preview?session_id=...&reportType=full-life&auto_generate=true`
2. **Check logs**:
   - ✅ Exactly **one** `[AUTOSTART]` log entry
3. **Verify behavior**:
   - ✅ Same as Test 1 (immediate start, monotonic timer, completion/Retry)

---

## Success Criteria

✅ **Build**: `npm run release:gate` passes in real runner  
✅ **Logs**: Exactly one `[AUTOSTART]` per attempt  
✅ **Behavior**: Controller leaves `idle` immediately, timer monotonic, completion/Retry within 120s  
✅ **No regressions**: Second load works (not just first load)

---

## If Verification Fails

### Build fails in real runner:
- Check `BUILD_EPERM_ANALYSIS.md` for EPERM sources
- Verify no `fs.readFileSync(".env.local")` in source (grep)
- Check Vercel/CI logs for exact error

### Multiple `[AUTOSTART]` logs:
- Single-flight guard may be failing
- Check `hasStartedForAttemptKeyRef` logic
- Verify `attemptKey` is stable (useMemo)

### Timer resets:
- Check timer start logic (should only start when controller enters `verifying`)
- Verify `loadingStartTimeRef` is not cleared during active attempt

### Infinite spinner:
- Check polling loop termination conditions
- Verify controller transitions to `completed` or `failed`
- Check watchdog timeout logic

---

**Last Updated**: 2026-01-17 18:00

