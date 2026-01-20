# Stable Build Changelog

## v1.0.0-stable-20260120-prodtest (2026-01-20 21:30) ✅ **MOST STABLE**

**Commit**: `28c41c3`  
**Full SHA**: `28c41c3e1eecfce9befb0e95ea44242e1b1760fd`  
**Status**: ✅ **MOST STABLE - TESTED WITH PROD TEST USERS & REAL REPORTS**

### What's New
- ✅ **Production test user support** - Real reports for `prodtest_*` sessions
- ✅ **Complete subscription flow** - All endpoints handle `prodtest_subscription_*`
- ✅ **Fail-fast error handling** - Prevents placeholder contamination
- ✅ **OpenAI timeout fixes** - 110s for complex reports (matches server timeout)
- ✅ **Timer persistence** - Survives component remounts
- ✅ **Payment verification** - Works for production test users

### Critical Fixes
1. Subscription GET endpoint handles `prodtest_subscription_*`
2. Subscription cancel/resume endpoints handle `prodtest_subscription_*`
3. OpenAI client timeout increased to match server timeout
4. Payment verification handles `prodtest_*` sessions
5. Fail-fast for allowlisted users (no placeholder contamination)
6. Placeholder replacement text improved
7. Timer persistence with sessionStorage

### Tested With
- ✅ Production test users (`prodtest_*` sessions)
- ✅ Real report generation (not mock)
- ✅ Complete subscription flow
- ✅ All report types
- ✅ Error scenarios

### How to Use
```bash
git checkout v1.0.0-stable-20260120-prodtest
# OR
git checkout 28c41c3
```

---

## v1.0.0-stable-20260119 (2026-01-19 23:00) - Previous Stable

**Commit**: `1c37281`  
**Status**: ✅ **STABLE - TESTED WITH MOCK REPORTS**

### What's Included
- Short reports issue resolved
- Mock content sanitization
- Price consistency
- UX improvements

### Note
- This build was tested with mock reports only
- Superseded by `v1.0.0-stable-20260120-prodtest` which includes real report testing

---

## Build Comparison

| Feature | v1.0.0-stable-20260119 | v1.0.0-stable-20260120-prodtest |
|---------|------------------------|--------------------------------|
| Test Users | `test_session_*` (mock) | `prodtest_*` (real reports) |
| Report Generation | Mock | Real AI-generated |
| Subscription Flow | Partial | Complete |
| Error Handling | Basic | Fail-fast |
| Timeout Handling | 45s client | 110s client (matches server) |
| Timer Persistence | No | Yes (sessionStorage) |
| Payment Verification | Partial | Complete |

---

## Recommendation

**Use `v1.0.0-stable-20260120-prodtest`** for production fallback as it:
- Has been tested with production test users
- Includes real report generation
- Has complete subscription flow
- Has all critical fixes from ChatGPT feedback
- Is the most recent and comprehensive stable build
