# Cursor Autopilot Starter (paste at top of tasks)

Work in **Autopilot (safe, non-blocking)** mode:
- Keep moving end-to-end; do not wait idle for popups/approvals.
- Batch changes: **≤ 5 files per batch**, one concern per batch. No repo-wide changes unless I ask.
- If the model/provider fails ("Try again/Resume"): retry **3x** with backoff **10s → 30s → 60s**.
  - If still failing: switch to **OFFLINE PROGRESS** (safe edits only), write exact diffs/commands, and log required clicks/settings in `CURSOR_ACTIONS_REQUIRED.md`.
- If an approval/popup appears (including "Allow popups safely"): **skip that action**, log it in `CURSOR_ACTIONS_REQUIRED.md`, update `CURSOR_PROGRESS.md`, and continue with the next safe task.
- Always ask before terminal commands, installs, deletes, network/external APIs, git commit/push.

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


