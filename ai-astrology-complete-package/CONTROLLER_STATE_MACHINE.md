# Controller State Machine Documentation

ChatGPT Feedback: "Paste the controller status enum/state machine and where transitions happen"

## State Enum

```typescript
export type ReportGenerationStatus =
  | 'idle'
  | 'verifying'
  | 'generating'
  | 'polling'
  | 'completed'
  | 'failed'
  | 'timeout';
```

## Legal Transitions

```typescript
const LEGAL_TRANSITIONS: Record<ReportGenerationStatus, ReportGenerationStatus[]> = {
  idle: ['verifying', 'generating', 'idle'], // Allow idle->idle for reset
  verifying: ['generating', 'polling', 'completed', 'failed', 'timeout'], // Allow verifying->completed for immediate completion
  generating: ['polling', 'completed', 'failed', 'timeout'],
  polling: ['completed', 'failed', 'timeout'],
  completed: ['idle'], // Can only go to idle (user action required to retry)
  failed: ['idle'], // Can only go to idle (user action required to retry)
  timeout: ['idle'], // Can only go to idle (user action required to retry)
};
```

## State Flow

**Normal Flow:**
```
idle → verifying → generating → polling → completed → idle
```

**Immediate Completion (fast generation):**
```
idle → verifying → completed → idle
```

**Error Flow:**
```
idle → verifying → failed → idle
idle → generating → failed → idle
idle → polling → failed → idle
```

**Timeout Flow:**
```
idle → verifying → timeout → idle
idle → generating → timeout → idle
idle → polling → timeout → idle
```

## Where Transitions Happen

### 1. `idle → verifying`
**Location:** `useReportGenerationController.ts` - `start()` function
**When:** Controller starts and payment verification is needed
**Code:**
```typescript
setState(transitionState(state, 'verifying', {
  startTime: Date.now(),
  reportId: null,
  error: null,
}));
```

### 2. `verifying → generating`
**Location:** `useReportGenerationController.ts` - After payment verification succeeds
**When:** Payment verified, starting report generation
**Code:**
```typescript
setState(transitionState(state, 'generating', {
  reportId: reportId,
}));
```

### 3. `generating → polling`
**Location:** `useReportGenerationController.ts` - After POST to generate-report returns 202
**When:** Backend returns "processing" status, starts polling
**Code:**
```typescript
setState(transitionState(state, 'polling', {
  reportId: reportId,
}));
```

### 4. `polling → completed`
**Location:** `useReportGenerationController.ts` - `pollForReport()` function
**When:** Polling GET returns 200 with report content
**Code:**
```typescript
setState(transitionState(state, 'completed', {
  reportId: reportId,
  error: null,
}));
setReportContent(data.content);
```

### 5. `* → failed`
**Location:** `useReportGenerationController.ts` - Error handlers in `start()` and `pollForReport()`
**When:** Any error occurs during verification, generation, or polling
**Code:**
```typescript
setState(transitionState(state, 'failed', {
  error: errorMessage,
}));
```

### 6. `* → timeout`
**Location:** `useReportGenerationController.ts` - `pollForReport()` function
**When:** Maximum poll attempts exceeded (maxAttempts * pollInterval)
**Code:**
```typescript
setState(transitionState(state, 'timeout', {
  error: 'Report generation timed out',
}));
```

### 7. `completed/failed/timeout → idle`
**Location:** `useReportGenerationController.ts` - `cancel()` function or user retry
**When:** User cancels or retries after completion/failure
**Code:**
```typescript
setState(createInitialState()); // Resets to idle
```

## Transition Guards

All transitions are validated via `isLegalTransition()`:
- Prevents invalid state changes
- Logs warnings for illegal transitions
- Returns current state if transition is illegal

## Key Properties

1. **Single Owner:** Controller owns all state transitions - no external state can change controller status
2. **Deterministic:** Each state has explicit allowed transitions
3. **No Cycles:** Can only go `idle → ... → completed/failed/timeout → idle` (no loops)
4. **User-Driven Reset:** Can only return to `idle` from terminal states (`completed`, `failed`, `timeout`)
5. **Immutable Transitions:** State machine validates every transition before applying it

