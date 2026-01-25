# Vercel Environment Variable Approach - Recommendation

**Date**: 2026-01-19  
**Status**: ✅ Recommended for Cleaner Solution

---

## Issue Summary

The user identified two problems with the UI toggle approach:
1. **Toggle only visible after report generates** - Not visible during loading phase
2. **State doesn't persist across flow** - Toggle resets when regenerating via same flow

**Suggestion**: Use Vercel environment variable instead for a cleaner solution.

---

## Recommendation: **YES - Use Vercel Environment Variable**

### Why This Is Better

✅ **Cleaner**: No UI complexity, no state management  
✅ **Persistent**: Set once in Vercel, applies to all test sessions  
✅ **Simple**: No URL parameters needed, no sessionStorage  
✅ **Reliable**: Always works, no race conditions  
✅ **Production-ready**: Better for controlled testing phases  

---

## Implementation

### Option 1: Environment Variable (Recommended)

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Key**: `ALLOW_REAL_FOR_TEST_SESSIONS`
   - **Value**: `true`
   - **Environment**: Select:
     - ☑️ **Production** (for production testing)
     - ☑️ **Preview** (for preview deployments)
     - ☐ **Development** (optional)

3. **Redeploy** after setting the variable

**Result**: All test sessions (`test_session_*`) will automatically use real AI generation.

---

### Option 2: Keep UI Toggle + Env Var (Hybrid)

**Best of Both Worlds:**
- **Default behavior**: Controlled by environment variable
- **Override capability**: UI toggle can still override for individual sessions
- **Flexibility**: Toggle works per-session, env var works globally

**Implementation**: 
- Check environment variable first
- If `ALLOW_REAL_FOR_TEST_SESSIONS=true`, default to real mode
- UI toggle can still switch to mock if needed
- Persist toggle state in sessionStorage for flow continuity

---

## Current Implementation Status

### ✅ Fixed Issues
1. **Toggle visibility**: Now visible even during loading (moved before reportContent check)
2. **State persistence**: Added sessionStorage persistence across flow
3. **URL sync**: Toggle state syncs with URL parameter

### 🔄 Remaining Consideration

**Should we:**
- **Option A**: Keep UI toggle + add env var as default override
- **Option B**: Remove UI toggle, use only env var (cleaner)

**Recommendation**: **Option A (Hybrid)** - Best flexibility

---

## Implementation Plan (Hybrid Approach)

### 1. Update Toggle Logic

```typescript
// Priority: URL > sessionStorage > env var > false
const getInitialUseRealMode = () => {
  // 1. Check URL (highest priority - explicit override)
  if (useRealFromUrl) return true;
  
  // 2. Check sessionStorage (persist across flow)
  try {
    const stored = sessionStorage.getItem("aiAstrologyUseRealMode");
    if (stored === "true" || stored === "false") {
      return stored === "true";
    }
  } catch {}
  
  // 3. Check environment variable (global default)
  if (process.env.NEXT_PUBLIC_ALLOW_REAL_FOR_TEST_SESSIONS === "true") {
    return true;
  }
  
  // 4. Default to mock
  return false;
};
```

### 2. Update Backend API

```typescript
// In generate-report/route.ts
const allowRealForTestSessions = 
  process.env.ALLOW_REAL_FOR_TEST_SESSIONS === "true";
const shouldUseRealMode = 
  forceRealMode || allowRealForTestSessions;
```

### 3. Update Documentation

- Document environment variable option as primary method
- Keep UI toggle as per-session override
- Update guides with env var setup instructions

---

## Environment Variable Setup Instructions

### For Production Testing

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings** → **Environment Variables**
4. **Add Variable**:
   ```
   Name: ALLOW_REAL_FOR_TEST_SESSIONS
   Value: true
   Environments: Production, Preview
   ```
5. **Redeploy** (or wait for next deployment)

### For Development

Add to `.env.local`:
```bash
ALLOW_REAL_FOR_TEST_SESSIONS=true
```

**Note**: This is a **server-side** variable, so it needs to be set in Vercel for production.

---

## Comparison

| Feature | UI Toggle Only | Env Var Only | Hybrid (Recommended) |
|---------|----------------|--------------|----------------------|
| **Visibility** | ✅ Visible in UI | ❌ No UI | ✅ Visible in UI |
| **Per-session control** | ✅ Yes | ❌ No | ✅ Yes |
| **Global default** | ❌ No | ✅ Yes | ✅ Yes |
| **State persistence** | ⚠️ Needs storage | ✅ Automatic | ✅ Automatic |
| **Cleaner code** | ⚠️ More complex | ✅ Simple | ⚠️ Moderate |
| **Flexibility** | ⚠️ Per-session only | ⚠️ Global only | ✅ Both |

---

## Recommendation

**Use Hybrid Approach:**
1. ✅ Set `ALLOW_REAL_FOR_TEST_SESSIONS=true` in Vercel for global default
2. ✅ Keep UI toggle for per-session overrides
3. ✅ Toggle state persists across flow (sessionStorage)
4. ✅ Toggle visible even during loading

This gives you:
- **Global control** via environment variable (set once, works everywhere)
- **Per-session flexibility** via UI toggle (override when needed)
- **Best user experience** (toggle always visible, state persists)

---

## Next Steps

1. ✅ Fixed toggle visibility (already done)
2. ✅ Fixed state persistence (already done)
3. ⏳ Add environment variable support to backend
4. ⏳ Update toggle logic to respect env var default
5. ⏳ Document env var setup in Vercel

---

**Last Updated**: 2026-01-19  
**Status**: ✅ Recommendation provided - Hybrid approach preferred

