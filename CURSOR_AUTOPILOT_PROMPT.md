# Cursor Autopilot Starter (paste at top of tasks)

## CURSOR AUTOPILOT MODE – minimal interruptions

**CRITICAL RULES**:
1. **Do not ask me to click things repeatedly**. If a click is required, consolidate all pending edits into ONE accept step.
2. **If blocked, update `CURSOR_ACTIONS_REQUIRED.md` with exact next actions**.
3. **Never continue with partial context. Re-run tests before proceeding**.

Work in **Autopilot (safe, non-blocking)** mode:
- Keep moving end-to-end; do not wait idle for popups/approvals.
- **Work in batches of one file at a time** (minimizes "Confirm edit" prompts).
- **After each edit**: run `npm run ci:critical`. If it fails, revert and try again.
- Batch changes: **≤ 3 files per batch** (prefer 1 file), one concern per batch. No repo-wide changes unless I ask.
- If the model/provider fails ("Try again/Resume"): retry with exponential backoff **30s → 60s → 120s** (3 attempts total).
  - If still failing: write exact pending steps into `CURSOR_ACTIONS_REQUIRED.md` and stop.
- If "Confirm edit" / "Accept" prompt appears:
  - **STOP making further changes** immediately.
  - Write summary to `CURSOR_ACTIONS_REQUIRED.md` including: file name, change intent, why it is safe.
  - Wait for a single "Accept", then continue automatically with the next steps.
- If an approval/popup appears (including "Allow popups safely"): **skip that action**, log it in `CURSOR_ACTIONS_REQUIRED.md`, update `CURSOR_PROGRESS.md`, and continue with the next safe task.
- **CRITICAL (2026-01-18)**: **ALWAYS get user approval before git push**. Commits are fine, but NEVER push without explicit user approval. Show what will be pushed and wait for confirmation.
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


