# Task 30 — Accessibility (WCAG 2.1 AA) audit pass

**Traces to:** L2-021
**Design references:** all screens.
**User value:** The app is fully usable by keyboard and screen-reader users; color contrast meets AA.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/a11y.spec.ts` using `@axe-core/playwright`:
  ```ts
  // Acceptance Test
  // Traces to: L2-021
  // Description: Each routed view passes axe with no violations of impact "serious" or "critical".
  ```
  Scenarios:
  1. Run axe on `/`, `/goals`, `/goals/:id`, `/rewards`, `/profile` at 360/768/1440.
  2. Tab order across the shell is logical; focus visible.
  3. All icon-only buttons have `aria-label`.
- Run; confirm RED.

## Implementation outline

- Add a "Skip to main content" link as the first focusable element in the shell.
- Set `<html lang="en">` and per-route `<title>` via Angular `Title`.
- Add missing `aria-label`s, programmatic labels for form fields, and `aria-describedby` for validation messages.
- Verify focus traps in dialogs/sheets and focus restoration on close.

## Definition of Done

- Playwright + axe spec green at 360/768/1440 with no serious/critical issues.
- Lighthouse a11y score >= 95 on each routed view.
- **UI design inspection:** focus rings (`--hg-focus-ring`) visible and consistent across components at all breakpoints.
