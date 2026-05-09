---
status: Complete
---

# Task 05 — HttpClient and ProblemDetails error mapping

**Traces to:** L2-016, L2-022 (correlation), L2-013 (no token logging)
**Design references:** `Yvsng` — error/banner states (`m203bZ`, `Y0n6fU`).
**User value:** Backend errors surface as friendly, typed errors instead of raw 4xx/5xx noise; the user sees a banner with a correlation id when something fails.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/StatusBannerPage.ts` with `expectErrorBanner(text)` and `correlationId()`.
- Add `frontend/e2e/specs/error-mapping.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-016
  // Description: ProblemDetails responses surface as a typed error banner with the correlation id.
  ```
  Scenarios using `page.route` to mock the API:
  1. A `400` ProblemDetails with field errors on goal creation surfaces inline field messages.
  2. A `500` returns a status banner with the `X-Correlation-Id` header value visible.
  3. A `403` shows a forbidden message; a `404` shows a not-found message.
- Run; confirm RED.

## Implementation outline

- Add `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` inside `provideApiServices()`. (Auth interceptor is a no-op until task 07.)
- Add `error.interceptor.ts` mapping responses to typed errors: `NotFoundError`, `ForbiddenError`, `ValidationError`, `ServerError`. Capture `X-Correlation-Id`.
- Add `<hg-status-banner>` placement at the route-level layout for transient errors.
- Field-level `ValidationError` is consumable by reactive forms.
- Never log token or PII.

## Definition of Done

- Playwright spec green for all three error paths.
- Unit tests for the interceptor and each typed error pass.
- **UI design inspection:** at 360/768/1440, trigger a mocked 500; compare the banner against `m203bZ`/`Y0n6fU` for color, icon, padding, type, and dismiss-button visuals.
