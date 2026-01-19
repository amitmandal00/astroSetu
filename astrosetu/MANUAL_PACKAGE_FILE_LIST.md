# Manual Package File List - AI Astrology Complete

Use this list to manually verify or create the package. All paths are relative to `astrosetu/` directory.

## Core Feature Files

### Pages (`src/app/ai-astrology/`)
- `src/app/ai-astrology/page.tsx` - Landing page
- `src/app/ai-astrology/layout.tsx` - Layout
- `src/app/ai-astrology/input/page.tsx` - Input form
- `src/app/ai-astrology/preview/page.tsx` - Report preview
- `src/app/ai-astrology/payment/success/page.tsx` - Payment success
- `src/app/ai-astrology/payment/success/layout.tsx` - Payment layout
- `src/app/ai-astrology/payment/cancel/page.tsx` - Payment cancel
- `src/app/ai-astrology/payment/layout.tsx` - Payment layout
- `src/app/ai-astrology/subscription/page.tsx` - Subscription page
- `src/app/ai-astrology/subscription/success/page.tsx` - Subscription success
- `src/app/ai-astrology/bundle/page.tsx` - Bundle selection
- `src/app/ai-astrology/faq/page.tsx` - FAQ page
- `src/app/ai-astrology/year-analysis-2026/page.tsx` - Year analysis landing
- `src/app/ai-astrology/access/page.tsx` - Access control

### Libraries (`src/lib/ai-astrology/`)
- `src/lib/ai-astrology/types.ts` - TypeScript types
- `src/lib/ai-astrology/reportGenerator.ts` - **CRITICAL: Report generation logic + ensureMinimumSections**
- `src/lib/ai-astrology/prompts.ts` - **CRITICAL: AI prompt templates**
- `src/lib/ai-astrology/pdfGenerator.ts` - PDF generation
- `src/lib/ai-astrology/mockContentGuard.ts` - **CRITICAL: Mock content stripping**
- `src/lib/ai-astrology/reportStore.ts` - Database storage
- `src/lib/ai-astrology/reportValidation.ts` - Validation logic
- `src/lib/ai-astrology/reportCache.ts` - Caching
- `src/lib/ai-astrology/paymentToken.ts` - Payment tokens
- `src/lib/ai-astrology/payments.ts` - Payment utilities
- `src/lib/ai-astrology/freeReportGating.ts` - Free report logic
- `src/lib/ai-astrology/returnToValidation.ts` - Return validation
- `src/lib/ai-astrology/staticContent.ts` - Static content
- `src/lib/ai-astrology/testimonials.ts` - Testimonials
- `src/lib/ai-astrology/invoice.ts` - Invoice generation
- `src/lib/ai-astrology/dailyGuidance.ts` - Daily guidance
- `src/lib/ai-astrology/dateHelpers.ts` - Date utilities
- `src/lib/ai-astrology/ensureFutureWindows.ts` - Future windows
- `src/lib/ai-astrology/kundliCache.ts` - Kundli caching
- `src/lib/ai-astrology/openAICallTracker.ts` - OpenAI tracking
- `src/lib/ai-astrology/chargeback-defense.ts` - Chargeback defense
- `src/lib/ai-astrology/mocks/fixtures.ts` - Mock fixtures

### Components (`src/components/ai-astrology/`)
- `src/components/ai-astrology/AIHeader.tsx` - Header component
- `src/components/ai-astrology/AIFooter.tsx` - Footer component
- `src/components/ai-astrology/PWAInstallPrompt.tsx` - PWA prompt
- `src/components/ai-astrology/PostPurchaseUpsell.tsx` - Upsell component
- `src/components/ai-astrology/Testimonials.tsx` - Testimonials
- `src/components/ai-astrology/ReportTableOfContents.tsx` - TOC (removed from UI)

### API Routes (`src/app/api/ai-astrology/`)
- `src/app/api/ai-astrology/generate-report/route.ts` - **CRITICAL: Report generation API + fallback logic**
- `src/app/api/ai-astrology/create-checkout/route.ts` - Checkout creation
- `src/app/api/ai-astrology/cancel-payment/route.ts` - Payment cancellation
- `src/app/api/ai-astrology/capture-payment/route.ts` - Payment capture
- `src/app/api/ai-astrology/verify-payment/route.ts` - Payment verification
- `src/app/api/ai-astrology/input-session/route.ts` - Input session
- `src/app/api/ai-astrology/daily-guidance/route.ts` - Daily guidance API
- `src/app/api/ai-astrology/invoice/route.ts` - Invoice API
- `src/app/api/ai-astrology/chargeback-evidence/route.ts` - Chargeback evidence

## Test Files

### Unit Tests (`tests/unit/`)
- `tests/unit/lib/freeReportGating.test.ts`
- `tests/unit/hooks/useReportGenerationController.test.ts`

### Integration Tests (`tests/integration/`)
- `tests/integration/api/ai-astrology.test.ts`
- `tests/integration/generate-report-processing-lifecycle.test.ts`
- `tests/integration/report-store-availability.test.ts`
- `tests/integration/report-output-future-only.test.ts`
- `tests/integration/idempotency-report-generate.test.ts`
- `tests/integration/refund-scenarios.test.ts`
- `tests/integration/api/refund-triggers.test.ts`

### E2E Tests (`tests/e2e/`)
- `tests/e2e/free-report.spec.ts`
- `tests/e2e/paid-report.spec.ts`
- `tests/e2e/bundle-reports.spec.ts`
- `tests/e2e/all-report-types.spec.ts`
- `tests/e2e/report-generation-stuck.spec.ts`
- `tests/e2e/beta-access-blocks-ai-astrology.spec.ts`

### Contract Tests (`tests/contracts/`)
- `tests/contracts/report-flow.contract.md`

### Regression Tests (`tests/regression/`)
- `tests/regression/report-generation-flicker.test.ts`

## Documentation Files

### Primary Documentation (Root)
- `DEFECT_REGISTER.md` - **CRITICAL: All defects tracked here**
- `SHORT_REPORTS_ISSUE_SUMMARY.md` - **CRITICAL: Latest issue analysis**
- `ZIP_PACKAGE_SUMMARY.md` - Package summary
- `AI_ASTROLOGY_SETUP.md` - Setup instructions
- `AI_ASTROLOGY_IMPLEMENTATION_PLAN.md` - Implementation plan
- `AI_ASTROLOGY_TESTING_CHECKLIST.md` - Testing checklist
- `AI_ASTROLOGY_PLATFORM_SUMMARY.md` - Platform summary
- `CURSOR_OPERATING_MANUAL.md` - Operating manual
- `CURSOR_WORKFLOW_CONTROL.md` - Workflow control

### Fix Summaries
- `P0_P1_IMPLEMENTATION_SUMMARY.md`
- `AUTOMATIC_REFUND_REVIEW_ANALYSIS.md`
- `MOCK_CONTENT_STRIPPING_FIX_SUMMARY.md`
- `PDF_PREVIEW_MATCHING_FIX_SUMMARY.md`
- `REPORT_LENGTH_ANALYSIS.md`

### Operational Guides (Parent Directory)
- `../CURSOR_PROGRESS.md`
- `../CURSOR_ACTIONS_REQUIRED.md`
- `../CURSOR_AUTOPILOT_PROMPT.md`
- `../CURSOR_OPERATIONAL_GUIDE.md`

## Database Migrations (`docs/`)
- `docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql`
- `docs/AI_ASTROLOGY_REPORT_STORE_SUPABASE.sql`
- `docs/AI_ASTROLOGY_SUBSCRIPTIONS_SUPABASE.sql`

## Configuration Files
- `package.json` - Dependencies
- `package-lock.json` - Lock file
- `tsconfig.json` - TypeScript config
- `next.config.js` or `next.config.mjs` - Next.js config
- `vitest.config.ts` - Vitest config

## Scripts (`scripts/`)
- `scripts/validate-production.mjs` - Production validation
- `scripts/generate-build-meta.mjs` - Build metadata

## Workflows (`.github/workflows/`)
- Any CI/CD workflows related to AI Astrology

## Critical Files for Recent Fixes (2026-01-19)

These files contain the latest fixes for the "short reports" issue:

1. **`src/lib/ai-astrology/reportGenerator.ts`**
   - Contains `ensureMinimumSections()` function
   - Adds 6 fallback sections for decision-support, career-money, major-life-phase

2. **`src/lib/ai-astrology/mockContentGuard.ts`**
   - Enhanced mock content stripping
   - Cleans `decisionContext` and `recommendedTiming`
   - Recursive cleaning of all custom fields

3. **`src/app/api/ai-astrology/generate-report/route.ts`**
   - Applies `ensureMinimumSections()` to mock reports
   - Emergency fallback for empty sections
   - Enhanced logging (`[MOCK REPORT DEBUG]`, `[MOCK REPORT FINAL]`)

4. **`src/lib/ai-astrology/prompts.ts`**
   - Enhanced prompts requesting 6-9 detailed sections
   - Minimum word count requirements

## Package Verification Checklist

After creating the package, verify:

- [ ] All feature files present (pages, libraries, components, APIs)
- [ ] All test files present (unit, integration, e2e)
- [ ] All documentation files present
- [ ] Database migrations included
- [ ] Configuration files included
- [ ] Recent fixes included (check timestamps on key files)
- [ ] ZIP file extracts successfully
- [ ] File count matches expected (~100+ files)

## Expected File Count

- Feature files: ~40-50 files
- Test files: ~15-20 files
- Documentation: ~20-30 files
- Total: ~75-100 files

