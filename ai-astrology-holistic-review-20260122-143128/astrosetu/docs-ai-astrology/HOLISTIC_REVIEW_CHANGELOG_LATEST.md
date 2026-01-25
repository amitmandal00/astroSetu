# Holistic Review Changelog (Latest)

**Generated:** 2026-01-23  
**Scope:** AI Astrology platform stability, build reliability, production deployability, payments safety, and background processing.

---

## 1) Build failures (Vercel / CI)

### Symptoms
- Vercel builds failing repeatedly with TypeScript errors in `src/app/api/ai-astrology/generate-report/route.ts`
- Errors included missing exports / property typing issues (e.g., `getKundliWithCache`, `addLowQualityDisclaimer`, `quality`)

### Fixes shipped
- Replaced brittle static imports with safer dynamic imports and/or explicit typing where needed
- Ensured `quality` is carried through response + safe access when type inference breaks
- Added build-safe docs and verification notes

---

## 2) Report generation timeouts / resets / long waits (serverless constraints)

### Symptoms (from logs)
- `POST /api/ai-astrology/generate-report` timing out (504)
- OpenAI request timeouts (25s) or route-level watchdogs (60s/120s historically)
- Users experiencing “reset” loops and repeated costs on retries

### Key fixes shipped
- **Async processing for heavy reports**: `full-life`, `career-money`, `major-life-phase`, **and now `decision-support`**
  - `POST /generate-report` returns **202** quickly for these types
  - Worker endpoint processes queued jobs:
    - `POST /api/ai-astrology/process-report-queue`
  - UI polls status via existing `GET /api/ai-astrology/generate-report?reportId=...`
- Preview/bundle flows updated to treat **`DELIVERED`** as complete and allow longer polling windows for async.

---

## 3) Duplicate cost / retries / idempotency

### Symptoms
- User refreshes/retries could trigger duplicate OpenAI runs without strong idempotency

### Fixes shipped
- Idempotency already present via stored reports; enhanced where needed:
  - **Decision-support now includes `decisionContext` in the idempotency hash** to prevent cross-context collisions.

---

## 4) Payment safety + bypass controls

### Risks observed in logs
- `test_session_*` / `prodtest_*` flows bypassing Stripe in production logs

### Fixes shipped
- Added **hard guard** env var: `ENABLE_TEST_BYPASS`
  - In production, bypass is blocked unless explicitly enabled
  - Sentry warnings logged if bypass happens on production domain
- Worker captures Stripe manual-capture PaymentIntents only after successful delivery (validation passed and quality not LOW).

---

## 5) Prokerala instability / DOSHA endpoint 404

### Symptoms
- DOSHA endpoint 404 and/or credit exhaustion contributing to slower generation and degradation

### Fixes shipped
- Existing policy: feature omission (do not inject mock dosha content)
- Added **DOSHA circuit breaker** (in-memory) to avoid repeated calls after known failures.

---

## Operational requirements (important)

### Required Vercel env vars (Production)
- `REPORT_QUEUE_API_KEY`: required to authorize the worker endpoint
- `ENABLE_TEST_BYPASS`: recommended **unset/false** in production

### Required external cron (recommended on Vercel Free/Hobby)
Call every 1–2 minutes:
- `POST https://www.mindveda.net/api/ai-astrology/process-report-queue`
- Header: `x-api-key: REPORT_QUEUE_API_KEY`


