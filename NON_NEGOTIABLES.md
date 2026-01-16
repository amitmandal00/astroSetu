# NON‑NEGOTIABLES (Do Not Break)

## Engineering safety
- **No destructive commands**: never run `rm -rf`, `drop database`, `sudo`, disk ops, or similar.
- **No repo-wide refactors** unless explicitly asked.
- **No silent behavior changes**: if a behavior changes, add/adjust tests proving it.
- **Keep diffs tight**: ≤ 5 files per batch, one concern per batch.
- **CRITICAL (ChatGPT Feedback - Minimize Interruptions)**: Prefer **1 file at a time** to minimize "Confirm edit" prompts.
- **No refactors while fixing bugs**: Fix the bug with minimal surface area.
- **Always green before next change**: Must pass `npm run ci:critical` after every change set.

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

## Autopilot Workflow Invariants (ChatGPT Feedback - Minimize Interruptions)
- **Single-file edits**: When possible, edit one file at a time to reduce "Confirm edit" prompts.
- **Consolidate edits**: If multiple files need changes, batch them into ONE accept step when possible.
- **If confirmation required**: write `CURSOR_ACTIONS_REQUIRED.md` first, then pause.
  - Include: file name(s), change intent, why it is safe, exact next steps after acceptance.
- **Never proceed after connection error** without logging next actions to `CURSOR_ACTIONS_REQUIRED.md`.
- **Connection error handling**:
  - Retry with exponential backoff: 30s, 60s, 120s (3 attempts total).
  - If still failing: write exact pending steps into `CURSOR_ACTIONS_REQUIRED.md` and stop.
- **Root cause fixes** (to prevent connection errors):
  - Check VPN/proxy settings (disable or allowlist Cursor + API provider domains).
  - Verify OpenAI key rate limit/quota/billing/model mismatch.
  - Reduce concurrent agent actions: keep to 1–2 parallel tasks max.
- **Checkpoint script**: After every change, run `bash scripts/cursor-checkpoint.sh` (if available).
  - Runs: typecheck → build → critical tests
  - Writes output + next steps into `CURSOR_PROGRESS.md`
  - If failure: writes "what to do next" into `CURSOR_ACTIONS_REQUIRED.md`

## Stabilization Mode Invariants (ChatGPT Feedback - CRITICAL)
**If the user says "run all tests" or "stabilize build":**
- Enter **Stabilization Mode** and follow PHASE 0 → PHASE 4 exactly
- Do not exit early

**PHASE 0 — Freeze Scope**:
- ❌ Do NOT add new features
- ❌ Do NOT refactor unrelated code
- ❌ Do NOT change UI copy/styles
- ✅ Only fix what is required to pass tests and stabilize runtime behavior

**PHASE 1 — Full Test Execution (Mandatory)**:
- Run all tests in order: `type-check` → `build` → `test` → `test:critical` → `ci:critical`
- Do NOT skip any step

**PHASE 2 — Failure-Driven Fix Loop**:
- For each failure: Identify (test wrong? or code wrong?), apply minimal fix (≤ 5 files), enhance test if needed (never weaken), re-run all tests
- Repeat until everything passes

**PHASE 3 — Runtime Stability Verification**:
- After tests pass: Manually simulate first-load, polling convergence, subscription flow
- Confirm no infinite loops, no timer resets, no silent exits

**PHASE 4 — Lock the Win**:
- When stable: Update `CURSOR_PROGRESS.md` and `CURSOR_ACTIONS_REQUIRED.md` (only if human action needed)
- **STOP** - Do not continue improving or refactoring

**Absolute Non-Negotiable Rules**:
- If any test fails → you are NOT done
- If build fails → revert and fix
- If a fix breaks another test → revert and re-iterate
- Never silence errors
- Never bypass CI gates
- Never assume "second load works" is acceptable

**Success Condition**: `npm run ci:critical` passes AND no infinite loading states are possible.


