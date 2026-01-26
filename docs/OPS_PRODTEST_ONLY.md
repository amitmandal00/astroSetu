# OPS: Prodtest-Only Testing (No Code Changes)

## Production Access Lock
- Enable Vercel Production Password Protection.
- Share the password only with prodtest testers.
- Keep public traffic blocked during testing.

## Prodtest Bypass
- Keep `ALLOW_PROD_TEST_BYPASS=true` during the testing window.
- Do not disable it if prodtest sessions are required in production.

## Testing Rules (Token-Safe)
- Do not use `auto_generate=true` links in production tests.
- Use one tab only; avoid multi-tab testing.
- Do not refresh while "Preparing your report..." is visible.
- Wait for a final success/failure state before any new action.

## Report Testing Order
- Decision Support (cheapest) first.
- Year Analysis next.
- Heavy reports/bundles last (full-life, bundles).

