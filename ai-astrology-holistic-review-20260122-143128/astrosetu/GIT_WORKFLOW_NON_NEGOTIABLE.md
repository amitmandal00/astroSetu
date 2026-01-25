# Git Workflow - NON-NEGOTIABLE Rules

**Date**: 2026-01-19  
**Status**: 🚨 **ACTIVE - ENFORCED**  
**Priority**: **CRITICAL - CANNOT BE BYPASSED**

---

## 🚨 NON-NEGOTIABLE RULES

### 1. ALWAYS Keep All Changes
- ✅ **Commit locally** to preserve work (`git add` and `git commit` are fine)
- ✅ **Stage changes** as you work (`git add .` or `git add <file>`)
- ✅ **Commit with clear messages** describing what was changed
- ✅ **Local commits are safe** and preserve your work

### 2. ALWAYS Get Approval Before Git Push
- 🚨 **NEVER push to remote** without explicit user approval
- 🚨 **Show what will be pushed** before asking for approval:
  - Commit summary (commit messages)
  - Changed files list
  - Brief diff summary if applicable
- 🚨 **Wait for confirmation** before executing `git push`
- 🚨 **Do not proceed** if approval is not given

### 3. What to Show Before Approval
When requesting approval for git push, always include:
1. **Commit messages** (what commits will be pushed)
2. **Changed files** (list of files modified/added/deleted)
3. **Branch name** (which branch will be pushed)
4. **Remote target** (usually `origin main` or specific branch)
5. **Brief summary** (what the changes accomplish)

### 4. Approval Process
1. **Make changes** (edit files, implement features, fix bugs)
2. **Stage changes** (`git add .`)
3. **Commit locally** (`git commit -m "clear message"`)
4. **Show summary** (display what will be pushed)
5. **Request approval** (ask user to approve)
6. **Wait for approval** (do not proceed until approved)
7. **Push after approval** (`git push origin <branch>`)

---

## ❌ What NOT to Do

### ❌ DO NOT Push Without Approval
- Even if changes seem minor
- Even if it's "just documentation"
- Even if it's "just a typo fix"
- Even if previous pushes were approved

### ❌ DO NOT Skip Approval Steps
- Do not push immediately after commit
- Do not assume approval from context
- Do not proceed if user hasn't explicitly approved

### ❌ DO NOT Bypass This Rule
- No exceptions for "emergency fixes"
- No exceptions for "small changes"
- No exceptions for "documentation only"
- This rule applies to **ALL** git push operations

---

## ✅ What IS Allowed

### ✅ Local Commits
- `git add .` - Stage changes
- `git commit -m "message"` - Commit locally
- `git status` - Check status
- `git log` - View commit history
- `git diff` - View changes

### ✅ Information Gathering
- `git log` - Show commits
- `git diff` - Show differences
- `git status` - Show status
- Any read-only git commands

---

## 📝 Example Approval Request

When requesting approval, use this format:

```
🚨 Git Push Approval Required

**Commits to push**:
- abc1234 feat: Add support for real AI reports for test sessions
- def5678 docs: Update operational guide with git workflow rules

**Changed files**:
- src/app/api/ai-astrology/generate-report/route.ts
- src/hooks/useReportGenerationController.ts
- CURSOR_OPERATIONAL_GUIDE.md
- TEST_WITH_REAL_REPORTS_GUIDE.md

**Branch**: main
**Remote**: origin

**Summary**: Added support for real AI report generation for test sessions and updated operational documentation.

**Approve git push?** (yes/no)
```

---

## 🔒 Enforcement

This rule is enforced in:
- ✅ `CURSOR_OPERATIONAL_GUIDE.md` - Added to NON-NEGOTIABLES section
- ✅ `CURSOR_WORKFLOW_CONTROL.md` - Added as Rule #0 (highest priority)
- ✅ `CURSOR_PROGRESS.md` - Updated git workflow section
- ✅ `CURSOR_AUTOPILOT_PROMPT.md` - Added to CRITICAL rules
- ✅ `CURSOR_ACTIONS_REQUIRED.md` - Documented as requirement
- ✅ `CURSOR_OPERATING_MANUAL.md` - Added to Non-Negotiable Contracts
- ✅ `GIT_WORKFLOW_NON_NEGOTIABLE.md` - This document (standalone reference)

---

## 📚 Related Documents

- `CURSOR_OPERATIONAL_GUIDE.md` - Complete operational guide
- `CURSOR_WORKFLOW_CONTROL.md` - Workflow control rules
- `CURSOR_AUTOPILOT_PROMPT.md` - Autopilot prompt rules
- `CURSOR_OPERATING_MANUAL.md` - Operating manual

---

**Last Updated**: 2026-01-19  
**Status**: ✅ **ACTIVE - ENFORCED**  
**Cannot be bypassed under any circumstances**

