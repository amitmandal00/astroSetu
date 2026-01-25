# Async Heavy Report Generation (full-life / career-money / major-life-phase)

## Why

Some report types are too heavy to generate reliably inside a single Vercel serverless request.  
We now **queue heavy reports** and generate them in a **background worker** while the UI polls status.

Heavy types:
- `full-life`
- `career-money`
- `major-life-phase`
- `decision-support`

Non-heavy types remain synchronous.

---

## How it works

### 1) Client calls `POST /api/ai-astrology/generate-report`

- For heavy types, the API returns **`202 Accepted`** quickly with `{ status: "processing", reportId }`.
- The Preview page keeps polling status via:
  - `GET /api/ai-astrology/generate-report?reportId=...`
- When the stored row becomes `DELIVERED`, the UI shows the content.

### 2) Background worker processes queued jobs

Endpoint:
- `POST /api/ai-astrology/process-report-queue`

Behavior:
- Picks `processing` rows that have no content yet
- Generates the heavy report server-side
- Stores the final content (status `DELIVERED`)
- Captures Stripe manual-capture payment intent **only after success**

---

## Required environment variables

### `REPORT_QUEUE_API_KEY` (recommended)

Used to secure the worker endpoint.

- When set, `generate-report` will *best-effort* trigger the worker immediately (fire-and-forget).
- External cron can also call the worker with this header:
  - `x-api-key: REPORT_QUEUE_API_KEY`

### `ENABLE_TEST_BYPASS` (optional; default recommended: **false** in production)

Hard-guard to prevent test/bypass flows leaking to real users.

When `ENABLE_TEST_BYPASS` is not enabled in production:
- `test_session_*` / `prodtest_*` bypass flows are blocked

---

## Deploy / Operations

### Option A: External cron (recommended on Free/Hobby Vercel plans)

Call every minute (or every 2 minutes):

- `POST https://YOUR_DOMAIN/api/ai-astrology/process-report-queue`
- Header: `x-api-key: REPORT_QUEUE_API_KEY`

This makes heavy reports complete even if the internal fire-and-forget trigger fails.

### Option B: Vercel cron (Pro plan)

If you have Vercel cron available, schedule the same endpoint.

---

## Notes

- This design keeps the UX stable: users stay on Preview and it will update once the report is ready.
- The background worker uses longer per-call OpenAI timeouts and limited retries to make heavy reports feasible.


