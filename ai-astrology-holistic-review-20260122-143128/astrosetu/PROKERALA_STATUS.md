# Prokerala API Status Guide

## Quick Status Check

### Current Issue: Credit Exhausted
```
[CircuitBreaker] Prokerala API circuit is open
[AstroSetu] Prokerala API credit exhausted, using fallback data
```

### What This Means:
- ✅ System is working correctly (using fallback data)
- ⚠️ Prokerala API credits have run out
- 📋 Action: Recharge Prokerala account

---

## Immediate Actions

### 1. Check Credit Balance
Visit: https://www.prokerala.com/account/dashboard
- Login to your Prokerala account
- Check current credit balance
- Note credit expiration date

### 2. Recharge Credits
If balance is low/zero:
- Purchase credits from Prokerala dashboard
- Recommended: 10,000+ credits for production
- Consider monthly/annual packages for better rates

### 3. Verify Recovery
After recharging:
- Wait 60 seconds (circuit breaker recovery timeout)
- System will automatically attempt to reconnect
- Generate a test report to verify API is working
- Check logs for successful API calls

---

## System Behavior

### With Credits Exhausted (Current State):
1. ✅ Circuit breaker opens automatically
2. ✅ All reports use calculated fallback data
3. ✅ No user-facing errors
4. ✅ System remains fully functional
5. ⏱️ Auto-recovery attempt every 60 seconds

### After Credits Restored:
1. ✅ Circuit breaker detects successful calls
2. ✅ Automatically closes after 2 successes
3. ✅ Full Prokerala API features restored
4. ✅ Reports use real-time API data

---

## Monitoring

### Check Circuit Breaker Status:
```bash
# Via API (if admin endpoint exists)
GET /api/admin/circuit-breaker-status

# Or check Vercel logs for:
[CircuitBreaker] Circuit closed after successful recovery
```

### Credit Usage Estimation:
- Typical report: 50-200 credits
- Bundle reports: 150-600 credits (multiple reports)
- Daily operations: ~5,000-10,000 credits/day (varies)

---

## Cost Optimization

1. **Caching:** Already enabled - reduces duplicate API calls
2. **Deduplication:** Already enabled - batches identical requests
3. **Fallback System:** Allows graceful degradation without failures

---

**Status:** System functioning correctly with fallback data. Recharge Prokerala credits when ready.

