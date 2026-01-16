# NON‑NEGOTIABLES (Do Not Break)

## Engineering safety
- **No destructive commands**: never run `rm -rf`, `drop database`, `sudo`, disk ops, or similar.
- **No repo-wide refactors** unless explicitly asked.
- **No silent behavior changes**: if a behavior changes, add/adjust tests proving it.
- **Keep diffs tight**: ≤ 5 files per batch, one concern per batch.

## AstroSetu product invariants
- **Future-only timing**: reports must never present timing windows/years in the past (for 20xx years).
- **Generation stability**: loader/timer must not reset to 0 mid-run or get stuck.
- **Subscription UX**: subscribe → checkout → success → dashboard must complete without refresh loops.
- **Free report quality**: free life-summary must be structured, readable, and feel valuable (no "thin" output due to parsing).

## Polling & Generation Invariants (ChatGPT Feedback)
- **Polling stop conditions**: polling loops may ONLY terminate on:
  - `abortController.signal.aborted` (user navigated away or component unmounted)
  - `!isMountedRef.current` (component unmounted)
  - `activeAttemptKeyRef.current !== attemptKey` (new generation started)
  - `status === "completed"` or `status === "failed"` (generation finished)
- **Never use UI state for polling**: do NOT use `isProcessingUIRef.current` or `isProcessingUI` to stop polling. UI state can flip during first-load and cause premature stops.
- **Timer monotonic**: timer start time (`loadingStartTimeRef.current`) must NOT be cleared during active generation. Only clear when:
  - Status becomes completed or failed, OR
  - User navigates away (component unmounts), OR
  - attemptKey changes (new generation started), OR
  - Max timeout reached (hard watchdog)
- **Hard watchdog**: if elapsed time > max timeout for reportType, client must exit spinner into a safe retry state (show "Timed out — Retry" button, do NOT continue infinite timer).

## Production Serverless Invariants (ChatGPT Feedback - CRITICAL)
- **Serverless timeout config**: Routes that can exceed default execution time MUST export:
  - `export const runtime = "nodejs";`
  - `export const maxDuration = 180;` (or higher for complex reports)
  - `export const dynamic = "force-dynamic";`
  - This prevents serverless function from dying mid-execution and leaving reports stuck in "processing".
- **Heartbeat required**: Long-running report generation MUST update `updated_at` every 15-20s:
  - Prevents stuck "processing" status when serverless function times out
  - Makes stale-processing detection meaningful
  - Must continue until generation completes or fails
- **Always mark failed on error**: Catch/finally MUST call `markStoredReportFailed`:
  - Reports never remain stuck in "processing" status
  - Even if generation throws or times out, status must be updated to "failed"
  - Prevents infinite polling on client side
- **Single-surface changes**: one bug = one subsystem. No refactors unless explicitly requested.
- **Fix server first, then UI**: No UI timer tweaks until API lifecycle is proven stable.
- **Every change must pass, locally**:
  - `npm run type-check`
  - `npm run build`
  - `npm run test:critical` (Playwright critical invariants)
- **If any check fails**: stop and write in `CURSOR_ACTIONS_REQUIRED.md` rather than trying random fixes.


