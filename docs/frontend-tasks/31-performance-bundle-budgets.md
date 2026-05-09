---
status: Complete
---

# Task 31 — Performance budgets and lazy chunks

**Traces to:** L2-019
**Design references:** N/A.
**User value:** The app loads fast on a typical mobile connection; route changes only download what they need.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/performance-budgets.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-019
  // Description: Route navigation downloads route-level chunks only; LCP meets budget on simulated 4G.
  ```
  Scenarios:
  1. Cold-load `/` on simulated mobile 4G via Playwright's CDP throttling — assert LCP <= 2.5s.
  2. Navigation to `/goals` downloads a new chunk that was not part of the initial bundle.
- Run; confirm RED.

## Implementation outline

- Confirm every feature route uses `loadChildren` with the feature's `*_ROUTES`.
- Configure `angular.json` `budgets` so `initial` JS is capped (e.g. 350KB compressed) — fail the build above.
- Use `@defer` blocks for below-the-fold sections (activity history, rewards on dashboard).
- Add `<link rel="preconnect">` for the API origin and OIDC origin in `index.html`.

## Definition of Done

- Playwright spec green.
- Production build passes the configured budgets.
- **UI design inspection:** verify no visual regression caused by `@defer` placeholders at 360/768/1440.
