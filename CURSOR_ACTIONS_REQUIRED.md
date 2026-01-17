# Cursor Actions Required

This file tracks actions that require user interaction (approvals, clicks, settings, etc.).

**CRITICAL**: When Cursor encounters a block, it will log here with:
- File name(s) that need acceptance
- Change intent
- Why it is safe
- Exact next steps after acceptance
- What prompt/screen appeared
- Where it appeared (which tool/screen)
- What exact click/setting is needed
- Why it's needed
- Safest alternative (if available)

## Current Actions Required

### Build Failure - EPERM Analysis (Pending Proof)
- **Timestamp**: 2026-01-17 (Stabilization Mode PHASE 1)
- **Failure**: Build failed with `EPERM: operation not permitted`
- **Error locations** (requires exact file+line proof):
  - `.env.local` file read: **PROOF NEEDED** - No code found reading `.env.local` during build
  - `src/app/api/notifications/vapid-public-key` directory scan: **PROOF NEEDED** - Likely Next.js scanning routes (normal behavior)
- **Analysis**:
  - ✅ `check-env-required.sh` only checks `process.env.*` (correct - no file reads)
  - ✅ `vapid-public-key/route.ts` only reads `process.env.VAPID_PUBLIC_KEY` (correct - no file reads)
  - ❓ Next.js may scan directories during build (normal behavior, but EPERM suggests permission issue)
- **Action needed**: 
  1. Provide exact file+line where code tries to read `.env.local` OR confirm it's Next.js scanning (not code)
  2. Verify build works outside sandbox with full permissions
  3. If build succeeds outside sandbox: Document as sandbox restriction with exact cause
  4. If build fails outside sandbox: Fix code (remove file reads, use `process.env` only)

---

## Template for Future Actions

When Cursor needs approval, it will use this format:

### Confirm Edit / Accept Prompt
- **File(s)**: `path/to/file.ts`
- **Change intent**: Brief description of what changed
- **Why it is safe**: Explanation of why this change is safe
- **Exact next steps after acceptance**: What Cursor will do after you click Accept
- **Action needed**: Click "Accept" button (⌘↩)

### Connection Error / Resume / Try Again
- **Error type**: Connection failed / Unable to reach model provider
- **Retry attempts**: X/3 (with backoff: 30s, 60s, 120s)
- **Pending steps**: Exact steps that were interrupted
- **Action needed**: Click "Resume" (↩) or "Try again" (⌘⇧↩)
- **Root cause check**: 
  - [ ] VPN/proxy disabled or allowlisted
  - [ ] OpenAI key valid (rate limit/quota/billing)
  - [ ] Model provider status checked

### Checkpoint Failed
- **Status**: Type check / Build / Tests failed
- **What to do next**: Specific fix instructions
- **Log files**: Paths to error logs
- **Action needed**: Fix errors, then re-run checkpoint

---

## Past Actions (Resolved)

- [x] Git push authentication - Resolved (credentials configured)
- [x] Production serverless timeout fix - Completed (maxDuration added)
- [x] Heartbeat implementation - Completed (every 18s during generation)
- [x] Tests added - Completed (E2E + integration)
- [x] Subscription flow verification - Completed (flow already correct)

---

**Last Updated**: 2026-01-17 11:45
