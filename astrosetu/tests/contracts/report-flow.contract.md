# Report Generation Flow Contract

## 🎯 Purpose
This contract defines the **legal behavior** of the report generation flow. Any code changes must respect these rules.

---

## 📊 State Machine

### States
- `idle` - No generation in progress
- `verifying` - Payment verification in progress
- `generating` - Report generation in progress
- `polling` - Waiting for async report completion
- `completed` - Report ready
- `failed` - Generation failed
- `timeout` - Generation timed out

### Legal Transitions
```
idle → verifying → generating → polling → completed
                              ↓
                            failed
                              ↓
                           timeout
```

**Rules:**
- Only one active attempt at a time
- New attempt aborts previous attempt
- Cannot transition from `completed` to `generating` without user action
- `timeout` and `failed` are terminal states (require user action to retry)

---

## ⏱️ Timer Contract

### Single Source of Truth
- **ONLY** `startTime` is stored (as ref or state)
- **NEVER** store `elapsedTime` as state
- **ALWAYS** compute: `elapsed = floor((now - startTime) / 1000)`

### Timer Behavior
- Timer starts when state transitions to `verifying` or `generating`
- Timer continues across state transitions (verifying → generating)
- Timer stops when state is `completed`, `failed`, or `timeout`
- Timer must not freeze, jump backwards, or continue after completion

### Timer Implementation
```typescript
// CORRECT: Compute, don't store
const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

// WRONG: Don't store elapsedTime
const [elapsedTime, setElapsedTime] = useState(0); // ❌
```

---

## 🔄 Polling Contract

### Cancellation Contract
- Every generation attempt MUST have an `attemptId`
- Every polling loop MUST use `AbortController`
- On new attempt → abort previous polling immediately
- On unmount → abort polling immediately
- On stage change → abort polling immediately

### Polling Behavior
- Only ONE poll loop active at a time
- Poll loop checks `attemptId` before updating state
- If `attemptId !== activeAttemptIdRef.current` → abort
- Poll loop must not update state after component unmounts

### Polling Implementation
```typescript
// CORRECT: AbortController + attemptId
const abortController = new AbortController();
const attemptId = generateAttemptId();

pollForReport(attemptId, abortController.signal).catch(() => {
  if (abortController.signal.aborted) return; // Ignore abort errors
  // Handle real errors
});

// On new attempt:
abortController.abort(); // Cancel previous polling
```

---

## 🎮 Generation Controller Contract

### Single-Flight Guard
- Only ONE active generation attempt at a time
- New attempt aborts previous attempt
- Store `activeAttemptIdRef` to track current attempt
- On any async resolve/reject: check `if (attemptId !== activeAttemptIdRef.current) return;`

### State Updates
- Only current attempt can update state
- Stale attempts must not update state
- State updates must be atomic (all related state updated together)

### Implementation
```typescript
// CORRECT: Single-flight guard
const activeAttemptIdRef = useRef<string | null>(null);

const startGeneration = async (input) => {
  const attemptId = generateAttemptId();
  activeAttemptIdRef.current = attemptId;
  
  try {
    const result = await generateReport(input);
    if (attemptId !== activeAttemptIdRef.current) return; // Stale attempt
    setState(result);
  } catch (error) {
    if (attemptId !== activeAttemptIdRef.current) return; // Stale attempt
    setError(error);
  }
};
```

---

## 🧪 Testing Contract

### Regression Test Requirements
Every fix must include a test that:
1. Reproduces the real bug
2. Tests real component (not just logic)
3. Tests stage transitions
4. Tests concurrency/race conditions
5. Tests cancellation

### Test Example
```typescript
it('should handle rapid stage transitions without timer freeze', async () => {
  // Start generation
  // Receive processing status
  // Start polling
  // Flip stage verifying→generating quickly
  // Trigger retry click
  // Ensure only 1 poll loop exists
  // Ensure timer continues to tick
  // Ensure timer stops on completion
});
```

---

## 🚫 Anti-Patterns (DO NOT DO)

### Timer Anti-Patterns
- ❌ Storing `elapsedTime` as state
- ❌ Multiple places resetting `elapsedTime`
- ❌ Using `setElapsedTime(0)` in multiple branches
- ❌ Reading state from closure in interval callback

### Polling Anti-Patterns
- ❌ Starting polling "in background" without cancellation
- ❌ Multiple poll loops running simultaneously
- ❌ Polling updating state after unmount
- ❌ No attempt tracking

### State Management Anti-Patterns
- ❌ Multiple sources of truth for same value
- ❌ State updates in multiple places
- ❌ No single-flight guard
- ❌ Stale attempts updating state

---

## ✅ Validation Checklist

Before merging any code changes:

- [ ] Timer uses single source of truth (startTime only)
- [ ] Timer computed, not stored
- [ ] Polling uses AbortController
- [ ] Polling checks attemptId before updating state
- [ ] Single-flight guard implemented
- [ ] State machine transitions are legal
- [ ] Regression test passes
- [ ] No anti-patterns present

---

**Contract Version**: 1.0  
**Last Updated**: 2026-01-13  
**Status**: Active

