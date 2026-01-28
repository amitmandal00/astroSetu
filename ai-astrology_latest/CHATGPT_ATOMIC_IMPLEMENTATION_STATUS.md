# Atomic Generation Implementation Status

**Date**: 2026-01-17 17:00  
**Status**: 🔴 **IN PROGRESS** - Implementing atomic generation surgically

---

## Implementation Progress

### ✅ Completed
1. **attemptKey computation added** (line ~280):
   ```typescript
   const attemptKey = useMemo(() => {
     const sessionId = searchParams.get("session_id") || "";
     const reportType = searchParams.get("reportType") || reportType || "";
     const autoGenerate = searchParams.get("auto_generate") === "true";
     return `${sessionId}:${reportType}:${autoGenerate}`;
   }, [searchParams, reportType]);
   ```

2. **hasStartedForAttemptKeyRef added** - Tracks if generation started for this attemptKey

3. **.cursor/rules updated** - Added "Atomic Generation Invariant" section with non-negotiables

---

### 🔴 In Progress
1. **Creating `startGenerationAtomically()` function** - Extract logic from setTimeout blocks
2. **Removing setTimeout on line 1266** - Delayed sessionStorage check (500ms delay)
3. **Removing setTimeout on line 1675** - Paid report generation (300ms delay)
4. **Adding useEffect** - Call startGenerationAtomically() when attemptKey changes and auto_generate=true

---

## Next Steps

### Step 1: Create startGenerationAtomically() function
**Location**: After generateReport function definition
**Logic to extract from setTimeout blocks**:
- Check sessionStorage for input/reportType
- Recover from localStorage if needed
- Set input/reportType state
- Verify payment if needed (for paid reports)
- Transition controller to 'verifying' immediately
- Start timer when controller.status === 'verifying'
- If verification fails, transition to 'failed'

### Step 2: Replace setTimeout on line 1266
**Current**: setTimeout(() => { /* complex logic */ }, 500)
**Replace with**: Call startGenerationAtomically() directly (no delay)

### Step 3: Replace setTimeout on line 1675
**Current**: setTimeout(() => { /* generation start */ }, 300)
**Replace with**: Call startGenerationAtomically() directly (no delay)

### Step 4: Add atomic generation useEffect
**Location**: After startGenerationAtomically() definition
**Logic**:
```typescript
useEffect(() => {
  const autoGenerate = searchParams.get("auto_generate") === "true";
  if (!autoGenerate) return;
  if (generationController.status !== 'idle') return; // Already started
  if (hasStartedForAttemptKeyRef.current === attemptKey) return; // Already attempted
  
  hasStartedForAttemptKeyRef.current = attemptKey;
  startGenerationAtomically();
}, [attemptKey, autoGenerate, generationController.status, startGenerationAtomically]);
```

---

## Files Modified

1. `astrosetu/src/app/ai-astrology/preview/page.tsx` - Adding attemptKey, removing setTimeouts (IN PROGRESS)
2. `.cursor/rules` - Added atomic generation rules ✅

---

## Success Criteria

✅ Within 1000ms of mount when `auto_generate=true`:
- `controller.status` becomes `verifying|generating|polling` OR `failed`
- Must NEVER remain `idle` while UI shows "Generating"
- Timer must start ONLY when `controller.status` enters `verifying`
- On failure, UI must show Retry and timer stops

✅ No setTimeout autostart remains
✅ Controller never stays `idle` when `auto_generate=true`

