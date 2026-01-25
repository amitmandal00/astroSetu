# Cursor Autopilot Starter (paste at top of tasks)

## CURSOR AUTOPILOT MODE – minimal interruptions

**CRITICAL RULES**:
1. **Follow `MVP_GOALS_FINAL_LOCKED.md`**: MVP goals are LOCKED and take precedence over all other rules
2. **🚨 COST OPTIMIZATION (2026-01-25)**: ALWAYS use scoped requests, NEVER analyze entire codebase, ALERT if > 500K tokens, BLOCK if > 2M tokens
3. **Do not ask me to click things repeatedly**. If a click is required, consolidate all pending edits into ONE accept step.
4. **If blocked, update `CURSOR_ACTIONS_REQUIRED.md` with exact next actions**.
5. **Never continue with partial context. Re-run tests before proceeding**.
6. **MVP System Rules**: Frontend never generates reports, Worker is only execution path, Payment captured only after success, Failures are terminal, No automatic retries
7. **Model policy**: Default to **Agent 2 (GPT-5.1 Codex Mini)** for autopilot/code work; always ask before switching to another model or agent.

Work in **Autopilot (safe, non-blocking)** mode:
- Keep moving end-to-end; do not wait idle for popups/approvals.
- **🚨 COST-AWARE**: ALWAYS use scoped requests (< 500K tokens), use @filename mentions, break large tasks into smaller requests
- **Work in batches of one file at a time** (minimizes "Confirm edit" prompts AND reduces token usage).
- **After each edit**: run `npm run ci:critical`. If it fails, revert and try again.
- Batch changes: **≤ 3 files per batch** (prefer 1 file), one concern per batch. No repo-wide changes unless I ask.
- **Before large requests**: Estimate tokens, calculate cost, alert if > 500K, require approval if > 1M, block if > 2M
- If the model/provider fails ("Try again/Resume"): retry with exponential backoff **30s → 60s → 120s** (3 attempts total).
  - If still failing: write exact pending steps into `CURSOR_ACTIONS_REQUIRED.md` and stop.
- If "Confirm edit" / "Accept" prompt appears:
  - **STOP making further changes** immediately.
  - Write summary to `CURSOR_ACTIONS_REQUIRED.md` including: file name, change intent, why it is safe.
  - Wait for a single "Accept", then continue automatically with the next steps.
- If an approval/popup appears (including "Allow popups safely"): **skip that action**, log it in `CURSOR_ACTIONS_REQUIRED.md`, update `CURSOR_PROGRESS.md`, and continue with the next safe task.
- **🚨 CRITICAL - GIT WORKFLOW (NON-NEGOTIABLE)**: 
  - **ALWAYS keep all changes**: Commit locally to preserve work (`git add` and `git commit` are fine)
  - **ALWAYS get approval before git push**: **NEVER** push to remote without explicit user approval
  - **Show what will be pushed**: Display commit summary and changed files before asking for approval
  - **Wait for confirmation**: Do not proceed with `git push` until user explicitly approves
  - **This is a NON-NEGOTIABLE rule that cannot be bypassed under any circumstances.**
- Always ask before terminal commands, installs, deletes, network/external APIs.
- **Run checkpoint script**: After every change, run `bash scripts/cursor-checkpoint.sh` (if available).

## Stabilization Mode (ChatGPT Feedback - CRITICAL)
**If the user says "run all tests" or "stabilize build":**
- Enter **Stabilization Mode**
- Follow PHASE 0 → PHASE 4 exactly (see `.cursor/rules` for full details)
- Do not exit early
- Success condition: `npm run ci:critical` passes AND no infinite loading states are possible
- Run: `bash scripts/cursor-stabilize.sh` to execute full stabilization workflow

## Critical Workflow Rules (ChatGPT Feedback)
- **No refactors in preview page** unless tests are added/updated first.
- **Any change touching**:
  - `preview/page.tsx`
  - `/api/ai-astrology/generate-report`
  - subscription routes
  must pass: `npm run ci:critical` locally.
- **Never add new import path** without updating the "build-imports" test.
- **Polling loops may only terminate on**: abort signal, unmount, attemptKey changed, completed/failed state.
- **Work in 1-file increments** for critical files (preview/page.tsx, polling logic).
- **After each change**: run `npm run ci:critical`.
- **If any test fails**: revert and fix tests first.
- **Do not widen scope**: Do not rename exports. Do not move files.

## Production Serverless Rules (ChatGPT Feedback - CRITICAL)
- **Single-surface changes**: one bug = one subsystem. No refactors unless requested.
- **No UI timer tweaks until API lifecycle is proven**: fix server first, then UI.
- **Serverless timeout config**: Any route that can exceed default execution time MUST export:
  - `export const runtime = "nodejs";`
  - `export const maxDuration = 180;` (or higher for complex reports)
  - `export const dynamic = "force-dynamic";`
- **Heartbeat required**: Long-running generation MUST update `updated_at` every 15-20s.
- **Always mark failed on error**: Catch/finally MUST call `markStoredReportFailed`.
- **Every change must pass, locally**:
  - `npm run type-check`
  - `npm run build`
  - `npm run test:critical`
- **If any one of these fails**: stop and write in `CURSOR_ACTIONS_REQUIRED.md` rather than "try random fixes".

## Autopilot Non-Negotiables (Minimize Interruptions)
- **No broad edits**: Max 1–3 files per change set (prefer 1 file at a time).
- **No refactors while fixing bugs**: Fix the bug with minimal surface area.
- **Always green before next change**: Must pass `npm run ci:critical` after every change set.
- **If confirmation required**: write `CURSOR_ACTIONS_REQUIRED.md` first, then pause.
- **Never proceed after connection error** without logging next actions to `CURSOR_ACTIONS_REQUIRED.md`.
- **Single-file edits**: When possible, edit one file at a time to reduce "Confirm edit" prompts.
- **Consolidate edits**: If multiple files need changes, batch them into ONE accept step when possible.


