# Autopilot Workflow - Complete ✅

**Date**: 2026-01-17  
**Status**: ✅ **AUTOPILOT MODE CONFIGURED** - Minimal interruptions workflow implemented

---

## 🎯 Objective

Configure Cursor to work in "autopilot without babysitting" mode, minimizing interruptions from:
- "Confirm edit" / "Accept" prompts
- "Connection Error" / "Resume" / "Try again" prompts

**Key Principle**: Can't auto-click Accept/Resume/Try again (safety), but can design workflow to minimize need for clicks.

---

## ✅ Implementation Complete

### 1. Updated `.cursor/rules` ✅

**Added**:
- **Autopilot Non-Negotiables**: Max 1–3 files per change set (prefer 1 file at a time)
- **Single-file edits**: When possible, edit one file at a time to reduce "Confirm edit" prompts
- **Consolidate edits**: Batch multiple files into ONE accept step when possible
- **Connection error handling**: Retry with exponential backoff (30s, 60s, 120s)
- **Checkpoint script**: Run after every change to verify green gates

**Key Rules**:
- If "Confirm edit" appears: STOP making changes, write to `CURSOR_ACTIONS_REQUIRED.md`, wait for single "Accept"
- If connection error: Retry 3x with backoff, then write to `CURSOR_ACTIONS_REQUIRED.md` and stop
- Never proceed after connection error without logging next actions

### 2. Updated `CURSOR_AUTOPILOT_PROMPT.md` ✅

**Added**:
- **CRITICAL RULES** at top:
  - "Do not ask me to click things repeatedly"
  - "If blocked, update `CURSOR_ACTIONS_REQUIRED.md` with exact next actions"
  - "Never continue with partial context. Re-run tests before proceeding"
- **Work in batches of one file at a time** (minimizes "Confirm edit" prompts)
- **After each edit**: run `npm run ci:critical`
- **If "Confirm edit" appears**: STOP, write to `CURSOR_ACTIONS_REQUIRED.md`, wait for single "Accept"
- **Connection error**: Retry with exponential backoff (30s, 60s, 120s)
- **Checkpoint script**: Run after every change

### 3. Updated `NON_NEGOTIABLES.md` ✅

**Added**:
- **Autopilot Workflow Invariants** section
- Prefer 1 file at a time to minimize "Confirm edit" prompts
- Consolidate edits into ONE accept step when possible
- Connection error handling with exponential backoff
- Root cause fixes (VPN/proxy, OpenAI key, reduce concurrent actions)
- Checkpoint script workflow

### 4. Created `scripts/cursor-checkpoint.sh` ✅

**Functionality**:
- Runs: typecheck → build → critical tests
- Writes output + next steps into `CURSOR_PROGRESS.md`
- If failure: writes "what to do next" into `CURSOR_ACTIONS_REQUIRED.md`
- Provides clear status and actionable next steps

**Usage**:
```bash
bash scripts/cursor-checkpoint.sh
```

### 5. Updated `CURSOR_ACTIONS_REQUIRED.md` ✅

**Added**:
- Template for future actions
- Format for "Confirm Edit / Accept Prompt" entries
- Format for "Connection Error / Resume / Try Again" entries
- Format for "Checkpoint Failed" entries
- Root cause checklist for connection errors

### 6. Updated `CURSOR_PROGRESS.md` ✅

**Added**:
- Checkpoint script workflow notes
- Single-file edit preference (≤ 3 files per batch, prefer 1)
- Connection error handling notes
- Root cause fixes for connection errors

---

## 🔧 Root Cause Fixes (To Prevent Connection Errors)

### A. "Unable to reach model provider / Connection Error"

**Root Causes**:
1. VPN / corporate proxy / unstable network
2. OpenAI key rate limit / quota / billing / model mismatch
3. Cursor model provider outage / transient

**Fixes**:
- Disable VPN (or allowlist Cursor + API provider domains)
- In Cursor settings, add a secondary provider/model fallback (if available)
- Reduce concurrent agent actions: keep to 1–2 parallel tasks max

### B. "Confirm edit" (Accept/Reject)

**Root Causes**:
- Cursor requires confirmation for file writes
- Multiple files changed at once

**Fixes**:
- Turn on Auto-apply safe edits (if available in Cursor version)
- Enforce "single-file edits"
- Enforce "no broad refactors"
- Enforce "no multi-folder changes"
- Enforce "commit after tests"

---

## 📋 Workflow Process

### Normal Flow (No Interruptions)
1. Edit one file at a time
2. Run `bash scripts/cursor-checkpoint.sh` after each edit
3. If all checks pass: Continue with next file
4. Update `CURSOR_PROGRESS.md` with what changed + tests passed

### If "Confirm edit" Appears
1. **STOP making further changes** immediately
2. Write to `CURSOR_ACTIONS_REQUIRED.md`:
   - File name(s)
   - Change intent
   - Why it is safe
   - Exact next steps after acceptance
3. Wait for single "Accept" click
4. Continue automatically with next steps

### If Connection Error Appears
1. Retry with exponential backoff: 30s, 60s, 120s (3 attempts)
2. If still failing:
   - Write exact pending steps to `CURSOR_ACTIONS_REQUIRED.md`
   - Stop making changes
   - Include root cause checklist

### If Checkpoint Fails
1. Check `CURSOR_ACTIONS_REQUIRED.md` for "what to do next"
2. Fix errors (type check / build / tests)
3. Re-run checkpoint: `bash scripts/cursor-checkpoint.sh`
4. Once all checks pass, continue with next change set

---

## ✅ Expected Outcomes

### Before
- ❌ Multiple "Confirm edit" prompts (one per file)
- ❌ Connection errors cause repeated "Try again" loops
- ❌ No clear next steps when blocked
- ❌ Changes proceed without verification

### After
- ✅ Single "Accept" for batched edits (when possible)
- ✅ Connection errors handled with backoff, then logged
- ✅ Clear next steps in `CURSOR_ACTIONS_REQUIRED.md`
- ✅ Checkpoint script verifies every change before proceeding

---

## 📝 Files Modified

1. `.cursor/rules` - Autopilot non-negotiables added
2. `CURSOR_AUTOPILOT_PROMPT.md` - Minimal interruptions mode
3. `NON_NEGOTIABLES.md` - Autopilot workflow invariants
4. `scripts/cursor-checkpoint.sh` - Checkpoint script (NEW)
5. `CURSOR_ACTIONS_REQUIRED.md` - Template for actions
6. `CURSOR_PROGRESS.md` - Checkpoint workflow notes

---

## 🚀 Usage

### For Cursor (Autopilot Mode)
1. Start with: "Work in autopilot mode - minimal interruptions"
2. Cursor will:
   - Edit one file at a time
   - Run checkpoint after each edit
   - Write to `CURSOR_ACTIONS_REQUIRED.md` when blocked
   - Wait for single "Accept" when needed

### For User
1. Check `CURSOR_ACTIONS_REQUIRED.md` when you return
2. Click "Accept" if needed (single click for batched edits)
3. Review checkpoint results in `CURSOR_PROGRESS.md`
4. Fix any errors listed in `CURSOR_ACTIONS_REQUIRED.md`

---

## ✅ Verification

- ✅ All workflow files updated
- ✅ Checkpoint script created and executable
- ✅ Templates added to `CURSOR_ACTIONS_REQUIRED.md`
- ✅ Root cause fixes documented

**Status**: ✅ **AUTOPILOT WORKFLOW COMPLETE** - Ready for use

---

## 📚 Related Documentation

- `.cursor/rules` - Autopilot non-negotiables
- `CURSOR_AUTOPILOT_PROMPT.md` - Minimal interruptions mode
- `NON_NEGOTIABLES.md` - Autopilot workflow invariants
- `scripts/cursor-checkpoint.sh` - Checkpoint script
- `CURSOR_ACTIONS_REQUIRED.md` - Actions template
- `CURSOR_PROGRESS.md` - Checkpoint workflow

