# Phase 2 Complete - Hooks Created

## ✅ Completed Tasks

### 1. useElapsedSeconds Hook ✅
**File**: `src/hooks/useElapsedSeconds.ts`

**Purpose**: Compute elapsed time from startTime (single source of truth)

**Key Features**:
- Never stores `elapsedTime` as state
- Computes: `elapsed = floor((now - startTime) / 1000)`
- Updates every 1s when running
- Stops when `isRunning` is false

**API**:
```typescript
const elapsed = useElapsedSeconds(startTime, isRunning);
```

**Benefits**:
- Eliminates timer freezing
- Eliminates timer jumping backwards
- Eliminates timer continuing after completion
- Single source of truth

---

### 2. useReportGenerationController Hook ✅
**File**: `src/hooks/useReportGenerationController.ts`

**Purpose**: Owns generation + polling + cancellation

**Key Features**:
- Single-flight guard (only one active attempt)
- AbortController for cancellation
- State machine integration
- Polling with cancellation contract
- Attempt tracking

**API**:
```typescript
const {
  status,           // 'idle' | 'verifying' | 'generating' | 'polling' | 'completed' | 'failed' | 'timeout'
  reportId,         // Current report ID
  error,            // Error message if failed
  startTime,        // When generation started
  progress,         // Progress for bundle reports
  reportContent,    // Generated report content
  start,            // Start generation
  cancel,           // Cancel current attempt
  retry,            // Retry (reset to idle)
} = useReportGenerationController();
```

**Benefits**:
- Prevents multiple poll loops
- Prevents stale attempts updating state
- Prevents polling continuing after unmount
- Single source of truth for generation state

---

### 3. State Machine ✅
**File**: `src/lib/reportGenerationStateMachine.ts`

**Purpose**: Define explicit states and legal transitions

**States**:
- `idle` - No generation in progress
- `verifying` - Payment verification
- `generating` - Report generation
- `polling` - Waiting for async completion
- `completed` - Report ready
- `failed` - Generation failed
- `timeout` - Generation timed out

**Legal Transitions**:
```
idle → verifying → generating → polling → completed
                              ↓
                            failed
                              ↓
                           timeout
```

**Benefits**:
- Prevents invalid state changes
- Makes state transitions explicit
- Easier to reason about
- Prevents race conditions

---

## 📊 Implementation Details

### Single-Flight Guard
```typescript
const activeAttemptIdRef = useRef<string | null>(null);

// On start:
const attemptId = generateAttemptId();
activeAttemptIdRef.current = attemptId;

// On any async operation:
if (activeAttemptIdRef.current !== attemptId) {
  return; // Stale attempt - ignore
}
```

### Cancellation Contract
```typescript
const abortController = new AbortController();

// Pass signal to all async operations
await fetch(url, { signal: abortController.signal });

// On cancel:
abortController.abort();
```

### Polling with Cancellation
```typescript
const pollForReport = async (reportId, attemptId, abortSignal) => {
  // Check if still active attempt
  if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
    return; // Abort
  }
  
  // Poll with abort signal
  const response = await fetch(url, { signal: abortSignal });
  
  // Check again after fetch
  if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
    return; // Abort
  }
  
  // Process response...
};
```

---

## 🎯 Next Phase: Integration

### Phase 3: Integrate Hooks into preview/page.tsx

**Status**: Ready to start

**Steps**:
1. Replace timer logic with `useElapsedSeconds`
2. Replace generation logic with `useReportGenerationController`
3. Update UI to use new hooks
4. Test thoroughly

**Files to Modify**:
- `src/app/ai-astrology/preview/page.tsx`

**Files to Update**:
- `tests/unit/timer-logic.test.ts`
- `tests/integration/timer-behavior.test.ts`
- `tests/regression/timer-stuck-stress.test.ts`

---

## ✅ Verification

- [x] Hooks created
- [x] State machine created
- [x] TypeScript types defined
- [x] Single-flight guard implemented
- [x] Cancellation contract implemented
- [x] Polling with cancellation implemented
- [x] Documentation created

---

## 📝 Notes

1. **Path Aliases**: Hooks use `@/lib/...` path aliases which work in Next.js build
2. **Type Safety**: All hooks are fully typed
3. **Backward Compatibility**: Hooks are designed to be drop-in replacements
4. **Testing**: Hooks can be tested independently

---

**Status**: ✅ Phase 2 Complete  
**Next**: Phase 3 - Integration  
**Date**: 2026-01-13

