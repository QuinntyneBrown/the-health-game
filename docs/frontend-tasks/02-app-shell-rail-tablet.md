---
status: Complete
---

# Task 02 — Tablet rail navigation

**Traces to:** L2-020, L2-021, L2-030
**Design references:** `Tablet / Home / 768` (`n7P1LI`) — `htRail` (80px width), `Tablet / Goals / 768` (`BVNJa`).
**User value:** On a tablet-sized viewport (768–1199), the user sees a slim left rail in place of the bottom nav.

## ATDD — Failing Playwright test (POM) first

- Extend `AppShellPage.ts` if needed.
- Add `frontend/e2e/specs/app-shell.tablet.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-020, L2-021, L2-030
  // Description: Tablet (768–1199) shows the rail and hides bottom nav and drawer.
  ```
  Scenarios at 1024×768:
  1. Visiting `/` shows the rail with the four primary nav items.
  2. Rail is visible; bottom nav and drawer are not.
  3. Clicking the rail's `Goals` item navigates to `/goals`.
- Run; confirm RED.

## Implementation outline

- Extend the viewport signal to return `rail` for `>=768 && <1200`.
- Render `<hg-navigation-bar [variant]="'rail'">` when `viewport() === 'rail'`.
- Hide the bottom nav at this breakpoint.
- Use rail width from the design (80px) wrapped in a token if not present (`--hg-size-rail` if added — only if a token is missing, otherwise use existing).

## Definition of Done

- Playwright spec green at 1024×768.
- Lint, build, unit tests pass.
- **UI design inspection:** at 768×1024 and 1024×768, compare against `n7P1LI` `htRail` — verify rail width, vertical item spacing, icon-only item visuals, active highlight, and that primary content sits to the right with the correct surface colors.
