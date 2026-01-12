# Pre-Push Checklist - Always Follow Before Git Push

## ⚠️ CRITICAL: Always Get User Approval Before Git Push

## Automated Checks (Run These First)

### 1. Type Checking
```bash
cd astrosetu
npm run type-check
```
**Required**: ✅ Must pass with no errors

### 2. Build Verification
```bash
npm run build
```
**Required**: ✅ Must compile successfully

### 3. Quick Verification (Both Combined)
```bash
npm run verify
```
**Required**: ✅ Must pass completely

## Manual Testing Checklist (Before Push)

Test these critical flows to ensure no existing functionality is broken:

### Free Reports
- [ ] Free life-summary report generates correctly
- [ ] Timer counts correctly (doesn't get stuck at 0s)
- [ ] Report content displays correctly
- [ ] No console errors

### Paid Reports
- [ ] Paid report generation works (test at least one type: marriage-timing, year-analysis, etc.)
- [ ] Payment flow works correctly
- [ ] Timer counts correctly throughout generation
- [ ] Report displays after payment
- [ ] Retry button works if generation fails

### Bundle Reports
- [ ] Bundle report generation works (2-report and 3-report bundles)
- [ ] Timer counts correctly
- [ ] All reports in bundle generate successfully
- [ ] No loops or stuck states

### Timer Functionality
- [ ] Timer starts when generation begins
- [ ] Timer counts up correctly (doesn't reset to 0)
- [ ] Timer doesn't get stuck at specific numbers
- [ ] Timer works for all report types (free, paid, bundles)

### Retry Button
- [ ] Retry button appears when report is not found
- [ ] Retry button works for free reports
- [ ] Retry button works for paid reports
- [ ] Retry button regenerates report correctly

### General Functionality
- [ ] No console errors in browser
- [ ] No infinite loops
- [ ] Loading states work correctly
- [ ] Error handling works correctly
- [ ] Navigation works correctly

## Code Quality Checks

- [ ] No TypeScript errors
- [ ] No build errors
- [ ] No linting errors (or only acceptable warnings)
- [ ] No console.error or console.warn in production code (except intentional error handling)
- [ ] No TODO/FIXME comments for critical functionality

## Recent Changes Verification

After recent timer fix and retry button fix, verify:
- [ ] Timer fix doesn't break existing timer functionality
- [ ] Retry button fix works for all report types
- [ ] No regressions in report generation flows

## Git Push Approval Process

### Step 1: Run Automated Checks
```bash
cd astrosetu
npm run verify
```
**Result**: Must show "Compiled successfully"

### Step 2: Manual Testing
Test at minimum:
- One free report
- One paid report
- Timer functionality
- Retry button (if applicable)

### Step 3: Get User Approval
**⚠️ DO NOT PUSH WITHOUT EXPLICIT USER APPROVAL**

Send message:
```
✅ Automated checks passed
✅ Manual testing completed (list what was tested)
⏳ Waiting for approval to push changes
```

### Step 4: Push Only After Approval
Only proceed with `git push` after receiving explicit approval.

## Quick Pre-Push Command

```bash
cd astrosetu
npm run verify && echo "✅ Checks passed - Ready for approval"
```

## Common Issues to Watch For

1. **Timer stuck at 0s**: Check if loadingStartTime is set correctly
2. **Infinite loops**: Check useEffect dependencies and conditions
3. **Build failures**: Check for TypeScript errors or missing imports
4. **Type errors**: Run `npx tsc --noEmit` to find all type issues
5. **Missing dependencies**: Check that all imports are available

## Emergency Rollback

If something breaks after push:
1. Identify the problematic commit
2. Revert the commit: `git revert <commit-hash>`
3. Test the revert
4. Push the revert commit
5. Investigate and fix in a new branch

