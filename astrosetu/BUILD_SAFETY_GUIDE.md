# Build Safety Guide - Preventing Vercel Build Failures

**Date**: 2026-01-14  
**Status**: ✅ **ACTIVE** - Must Follow for All Code Changes

---

## 🚨 Build Safety Non-Negotiables

### 1. No New Imports Unless Target File Exists
**CRITICAL**: Never add an import unless the target file exists in the repo.
- Check file exists before adding import
- Verify path is correct (use `@/` alias or correct relative path)

### 2. No "../../" Imports in src/lib - Use Path Alias
**CRITICAL**: Never use `../../` imports in `src/lib/`. Use `@/` alias or correct relative path.

**From `src/lib/ai-astrology/prompts.ts`**:
- ✅ **CORRECT**: `import { getCurrentYear } from "@/lib/time/futureWindows"`
- ✅ **CORRECT**: `import { getCurrentYear } from "../time/futureWindows"` (one level up)
- ❌ **WRONG**: `require("../../time/futureWindows")` (two levels up - goes to `src/time/` which doesn't exist)

**Path Calculation**:
- `src/lib/ai-astrology/prompts.ts` → `../time/` = `src/lib/time/` ✅
- `src/lib/ai-astrology/prompts.ts` → `../../time/` = `src/time/` ❌ (doesn't exist)

### 3. No require() in TypeScript Library Files
**CRITICAL**: Do not use `require()` in TypeScript library files; use ES imports.
- ✅ **CORRECT**: `import { getCurrentYear } from "@/lib/time/futureWindows"`
- ❌ **WRONG**: `const { getCurrentYear } = require("../time/futureWindows")`

**Exception**: `require()` is acceptable in:
- Server-side API routes (Next.js API routes)
- Build-time scripts
- Configuration files

### 4. Always Run Build Before Committing
**CRITICAL**: Before finalizing, run: `npm run type-check && npm run build`
- Both must pass before commit
- Use `npm run ci:critical` for full validation

### 5. Add/Update Critical Import Test
**CRITICAL**: Add/update a test in `tests/integration/build-imports.test.ts` that imports the modified entry module.
- Missing imports will fail in CI before Vercel
- Run `npm run test:build-imports` before commit

### 6. Production Build Gate
**CRITICAL**: Any PR must pass `npm run ci:critical` locally before committing.
- `ci:critical` = `type-check && build && test:build-imports`
- This prevents Vercel build failures

---

## 📋 Build Safety Checklist (Before Every Commit)

- [ ] All imports use correct paths (`@/` alias or correct relative path)
- [ ] No `require()` in TypeScript library files (use ES imports)
- [ ] Target files exist before adding imports
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
- [ ] `npm run test:build-imports` passes
- [ ] `npm run ci:critical` passes (all of the above)

---

## 🔧 Build Safety Scripts

### ci:critical
```bash
npm run ci:critical
```
Runs: `type-check && build && test:build-imports`
- Must pass before any commit
- Prevents Vercel build failures

### prepush
```bash
npm run prepush
```
Runs: `type-check && build`
- Quick check before push
- Catches most build issues

### test:build-imports
```bash
npm run test:build-imports
```
Runs: `vitest run tests/critical/build-imports.test.ts`
- Validates all critical imports resolve
- Catches missing modules before Vercel

---

## 🐛 Common Build Failure Patterns

### Pattern 1: Wrong Relative Path
**Error**: `Module not found: Can't resolve '../../time/futureWindows'`

**Cause**: Using `../../` when should use `../` or `@/`

**Fix**:
```typescript
// WRONG
const { getCurrentYear } = require("../../time/futureWindows");

// CORRECT (Option 1: Path alias)
import { getCurrentYear } from "@/lib/time/futureWindows";

// CORRECT (Option 2: Correct relative path)
import { getCurrentYear } from "../time/futureWindows";
```

### Pattern 2: Missing File
**Error**: `Module not found: Can't resolve '@/lib/time/futureWindows'`

**Cause**: File doesn't exist at that path

**Fix**: Create the file or fix the path

### Pattern 3: Missing Export
**Error**: `getCurrentYear is not exported from '@/lib/time/futureWindows'`

**Cause**: Function not exported

**Fix**: Add `export` keyword to function

---

## 📝 Cursor Prompt Template (For Build Safety)

When adding new imports, use this prompt:

```
Add import for [function] from [module]. 
1. Verify the target file exists at [path]
2. Use @/ alias or correct relative path (not ../../)
3. Use ES import syntax (not require())
4. Run npm run ci:critical and ensure it passes
5. Add/update test in tests/critical/build-imports.test.ts
```

---

## ✅ Verification

After any import changes:
1. Run `npm run type-check` ✅
2. Run `npm run build` ✅
3. Run `npm run test:build-imports` ✅
4. Run `npm run ci:critical` ✅

All must pass before commit.

---

**Last Updated**: 2026-01-14  
**Status**: ✅ **ACTIVE** - Must Follow for All Code Changes

