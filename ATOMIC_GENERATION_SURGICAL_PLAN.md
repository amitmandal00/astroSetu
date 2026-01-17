# Atomic Generation - Surgical Implementation Plan

**Status**: Ready to implement  
**File**: `astrosetu/src/app/ai-astrology/preview/page.tsx` (4346 lines)

---

## Current State

- ✅ `attemptKey` computation added (line ~207)
- ✅ `safeGetSessionStorage` helper added (line ~207)  
- ✅ `.cursor/rules` updated with atomic generation rules
- ❌ `startGenerationAtomically()` function - **TO BE CREATED**
- ❌ setTimeout on line ~1269 - **TO BE REMOVED** (500ms delay)
- ❌ setTimeout on line ~1678 - **TO BE REMOVED** (300ms delay)
- ❌ Atomic useEffect - **TO BE ADDED**

---

## Implementation Steps

### Step 1: Create startGenerationAtomically() function
**Location**: After `generateBundleReports` function (after line ~1143)  
**Logic to extract**: From the setTimeout blocks (lines ~1269-1776)
- SessionStorage reads (using safeGetSessionStorage)
- Input recovery from localStorage
- Payment verification (if needed)
- Report type determination
- Bundle handling
- Generation start (via controller)

### Step 2: Remove setTimeout on line ~1269
**Replace with**: Direct call to startGenerationAtomically()  
**Note**: Remove the entire setTimeout wrapper, keep the logic but move it into the function

### Step 3: Remove setTimeout on line ~1678  
**Replace with**: Direct call to generationController.start() (no delay)

### Step 4: Add atomic generation useEffect
**Location**: After startGenerationAtomically() definition  
**Logic**:
```typescript
useEffect(() => {
  const autoGenerate = searchParams.get("auto_generate") === "true";
  if (!autoGenerate) return;
  if (generationController.status !== 'idle') return;
  if (hasStartedForAttemptKeyRef.current === attemptKey) return;
  
  hasStartedForAttemptKeyRef.current = attemptKey;
  startGenerationAtomically();
}, [attemptKey, autoGenerate, generationController.status, startGenerationAtomically]);
```

---

## Complexity Note

The setTimeout blocks contain ~650 lines of complex logic:
- Input recovery (sessionStorage → localStorage fallback)
- Payment verification (async API call)
- Bundle handling
- Multiple conditional paths
- State updates

This requires careful extraction to maintain all logic paths while removing the delays.

---

## Success Criteria

✅ Within 1000ms of mount when `auto_generate=true`:
- `controller.status` becomes `verifying|generating|polling` OR `failed`
- Must NEVER remain `idle` while UI shows "Generating"
- Timer starts ONLY when `controller.status` enters `verifying`
- On failure, UI shows Retry and timer stops

✅ Zero setTimeout autostarts remain
✅ Controller never stays `idle` when `auto_generate=true`

