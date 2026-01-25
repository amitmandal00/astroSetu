# NON‑NEGOTIABLES (Do Not Break)

## MVP Goals Alignment (CRITICAL - 2026-01-25)
- **Follow `MVP_GOALS_FINAL_LOCKED.md`**: MVP goals are LOCKED and take precedence over all other rules
- **MVP Definition**: "A user authorizes payment once and always gets either a fully delivered report (or bundle) or no charge — with zero stuck states and zero money leakage."
- **Core Intent**: Stability > cleverness, Predictability > speed, One correct path > many flexible ones
- **No cron-for-correctness**: System must be correct without cron jobs
- **No automatic retries**: Failures are terminal and visible
- **Worker is the only execution path**: Frontend never generates reports
- **Payment captured only after success**: Never charge unless report/bundle is fully delivered

## Engineering safety
- **No destructive commands**: never run `rm -rf`, `drop database`, `sudo`, disk ops, or similar.
- **No repo-wide refactors** unless explicitly asked.
- **No silent behavior changes**: if a behavior changes, add/adjust tests proving it.
- **Keep diffs tight**: ≤ 5 files per batch, one concern per batch.
- **CRITICAL (ChatGPT Feedback - Minimize Interruptions)**: Prefer **1 file at a time** to minimize "Confirm edit" prompts.
- **No refactors while fixing bugs**: Fix the bug with minimal surface area.
- **Always green before next change**: Must pass `npm run ci:critical` after every change set.
- **CRITICAL (2026-01-18)**: **ALWAYS get user approval before git push**. Commits are fine, but NEVER push without explicit user approval. Show what will be pushed and wait for confirmation.

## AstroSetu product invariants
- **Future-only timing**: reports must never present timing windows/years in the past (for 20xx years).
- **Generation stability**: loader/timer must not reset to 0 mid-run or get stuck.
- **Subscription UX**: subscribe → checkout → success → dashboard must complete without refresh loops.
- **Free report quality**: free life-summary must be structured, readable, and feel valuable (no "thin" output due to parsing).
- **session_id ≠ processing state**: session_id in URL is an identifier, NOT a state signal. UI must be driven by controller status, never by URL params.
- **Bundle processing isolation**: bundleProcessing can ONLY affect bundle reports. If bundleProcessing is true but reportType is not a bundle, log invariant violation. (Future: promote to Sentry warning + soft error in non-prod)

## MVP System Rules (CRITICAL - 2026-01-25)
- **Frontend never generates reports**: All heavy work runs async via worker. Frontend only creates order, redirects to preview, polls status, renders result.
- **Worker is the only execution path**: No frontend generation allowed. Single source of truth: report/bundle status ∈ `queued | processing | completed | failed`.
- **Payment is captured only after success**: Capture happens only after single report → completed OR bundle → all items completed. On failure, PaymentIntent is cancelled immediately.
- **Failures are terminal and visible**: Status = failed, payment cancelled, no background retry. No automatic retries allowed.
- **Refreshing the page must not change backend state**: Preview page is idempotent - reload resumes polling, never re-enqueues jobs automatically.
- **No build is pushed unless build + tests are green**: Mandatory CI + pre-push gate (build, tests, lint/typecheck).
- **No new abstractions without explicit approval**: Keep system simple and predictable. Stability > cleverness.
- **Same input must always produce same outcome**: Deterministic behavior required.
- **Any change violating these is reverted immediately**.

## MVP Bulk Reports Conditions (CRITICAL - 2026-01-25)
Bulk is allowed **only if all below are true**:
- Bundle behaves as one logical unit
- Payment capture happens only after entire bundle succeeds
- No partial delivery to user
- One retry applies to the whole bundle
- UI sees one bundle status, not per-item complexity
**If any condition is broken → bulk is frozen.**

## MVP Yearly Analysis Special Rules (CRITICAL - 2026-01-25)
- **Known flakiness acknowledged**: Yearly analysis had known flakiness in last stable build. This is acknowledged and acceptable.
- **Strict requirements**:
  - Strict timeouts
  - Validation
  - Fallback "lite yearly" mode if needed
- **Never break the entire order**: If safe degradation is possible, use it. Never block on perfect yearly report.
- **Graceful degradation > perfect depth**: Better to deliver "lite yearly" than fail entire order.

## MVP Retry Rules (CRITICAL - 2026-01-25)
- **Retry allowed only if**:
  - `status = failed`
  - `retry_count = 0`
  - within 24h
- **Retry behavior**:
  - reuse same order
  - reuse same PaymentIntent (if valid)
  - one manual retry max
- **After retry**: Order becomes terminal
- **No automatic retries**: All retries are manual user-initiated only. Worker `max_attempts = 1`.

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

## Build & Environment Invariants (ChatGPT Feedback - CRITICAL)
- **Never conclude "not code issue" without proof**: Only claim sandbox/environment restriction if:
  - Failure is reproducible on a known-good runner (local/CI) AND
  - Code path reads forbidden resources (provide exact file+line for every EPERM cause)
- **Build must NOT require .env.local**: Next.js builds should succeed without `.env.local` file:
  - Use `process.env.*` only (never `fs.readFileSync(".env.local")`)
  - Validate env via `.env.example` + schema (zod/envalid), never by reading `.env.local`
  - If build fails because something tries to read `.env.local` directly from disk, that's a code/script issue
- **VAPID key dependency**: Push/VAPID key must read ONLY from `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY`:
  - If not present: disable push features gracefully (no crash, no build fail)
  - Never read from files during build
- **Test stages split correctly**: Tests must be split into independent gates:
  - `test:unit` (no network - can run anywhere)
  - `test:integration` (mock external network - can run anywhere)
  - `test:e2e` (only in CI runners that support browsers - can be skipped safely when unsupported)
- **When claiming EPERM/sandbox**: Must provide exact file+line where code tries to read restricted resource. No proof = no acceptance.

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


