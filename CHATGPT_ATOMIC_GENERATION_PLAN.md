# ChatGPT Atomic Generation Fix Plan

**Date**: 2026-01-17  
**Status**: In Progress  
**Root Cause**: First-load orchestration is non-deterministic due to setTimeout-based autostart

---

## Problem Statement

**Symptom**: "After very first initial load - yearly analysis report, full life report does not generate and timer resets after 1 seconds and nothing happens for report generation"

**Root Cause #1**: Generation is started indirectly and not atomically.
- On first page load (cold navigation), generation start depends on:
  - hydration timing
  - guarded setTimeout
  - availability of birth details / session verification
- Controller briefly enters idle again
- Timer resets or stops
- UI no longer re-triggers generation
- User is stuck forever

**Root Cause #2**: Multiple entry points for generation start:
- setTimeout-based autostart (line 1266, 1675)
- Payment verification callback (line 1400-1500)
- Various other paths
- No single orchestrator enforcing atomicity

---

## Required Fix (ChatGPT Command)

### FIX 1: Make report generation ATOMIC

**New Invariant (must be enforced in code)**:
> If preview page renders with `auto_generate=true`, then within ONE render cycle:
> - generation MUST enter `verifying|generating|polling`
> - OR fail with explicit error + Retry
> - It must NEVER remain `idle`

**Implementation Steps**:

1. **Remove all implicit generation starts (setTimeout, derived effects)**
   - Remove setTimeout on line 1266 (delayed sessionStorage check)
   - Remove setTimeout on line 1675 (paid report generation)
   - Remove all other setTimeout-based autostart paths

2. **Introduce single function: `startGenerationAtomically()`**
   - Must be called synchronously in a `useEffect`
   - Keyed ONLY on stable `attemptKey` (`session_id + reportType + auto_generate`)
   - Must:
     a) verify session (if needed)
     b) persist/confirm attempt
     c) transition controller to `'verifying'` immediately
   - Timer must start ONLY when `controller.status === 'verifying'`

3. **If verification fails or prerequisites are missing**:
   - controller must enter `'failed'`
   - UI must show Retry
   - timer must stop

4. **Remove setTimeout-based auto start entirely** - This is no longer optional.

---

## Implementation Plan

### Step 1: Create `attemptKey` computation
```typescript
const attemptKey = useMemo(() => {
  const sessionId = searchParams.get("session_id") || "";
  const reportType = searchParams.get("reportType") || "";
  const autoGenerate = searchParams.get("auto_generate") === "true";
  return `${sessionId}:${reportType}:${autoGenerate}`;
}, [searchParams]);
```

### Step 2: Create `startGenerationAtomically()` function
```typescript
const startGenerationAtomically = useCallback(async () => {
  // 1. Verify prerequisites
  // 2. Verify session (if needed)
  // 3. Transition controller to 'verifying' immediately
  // 4. Start timer when controller.status === 'verifying'
  // 5. If verification fails, transition to 'failed'
}, [/* dependencies */]);
```

### Step 3: Replace setTimeout with useEffect
```typescript
useEffect(() => {
  if (!autoGenerate) return;
  if (controller.status !== 'idle') return; // Already started
  if (hasStartedRef.current === attemptKey) return; // Already attempted
  
  hasStartedRef.current = attemptKey;
  startGenerationAtomically();
}, [attemptKey, autoGenerate, controller.status, startGenerationAtomically]);
```

### Step 4: Remove all setTimeout-based autostart paths

---

## Deliverables

- ✅ `preview/page.tsx` updated
- ✅ No setTimeout autostart remains
- ✅ Controller never stays idle when `auto_generate=true`
- ✅ Tests added to verify atomicity

---

## Testing

### Test 1: First-load atomic guarantee
**File**: `tests/e2e/first-load-atomic-generation.spec.ts`

**Given**: `preview?auto_generate=true&session_id=...`  
**Expect**:
- Within 1s: `controller.status !== 'idle'`
- Either enters `verifying/generating` OR `failed`
- Timer never resets to 0 while status is `idle`

---

## Notes

- This fix must be implemented carefully to avoid breaking existing flows
- All setTimeout-based autostart must be removed
- Generation must be atomic - start OR fail deterministically
- Timer must start only when controller enters `verifying` state

