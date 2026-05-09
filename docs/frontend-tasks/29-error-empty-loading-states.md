---
status: Accepted
---

# Task 29 — Error, empty, and loading states baseline

**Traces to:** L2-016, L2-021
**Design references:** `States` group `Yvsng` — empty, loading (spinner + skeleton), errors, dialogs, snackbars.
**User value:** Every routed view degrades gracefully with consistent empty, loading, and error UI.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/states-baseline.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-016, L2-021
  // Description: Empty, loading, and error states render consistently across goals, rewards, and profile.
  ```
  Scenarios (mocked):
  1. Loading state shows a `<mat-progress-spinner>` or skeleton until data resolves.
  2. Empty result renders `<hg-empty-state>` with the right copy.
  3. Server 500 renders the error banner with correlation id.
- Run; confirm RED.

## Implementation outline

- Add a small `loadable()` helper or use existing `toSignal` patterns to expose `{ loading, error, data }` to templates.
- Make sure each routed view consumes loading/error consistently.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** loading/empty/error states across goals, rewards, profile match the `Yvsng` group at 360/768/1440.
