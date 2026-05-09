---
status: Accepted
---

# Task 03 — Desktop drawer navigation

**Traces to:** L2-020, L2-021, L2-030
**Design references:** `Desktop / Home / 1440` (`v4ZmZr`) — `hdDrawer` (280px), `Desktop / Goals / 1440` (`rPVHK`).
**User value:** On a desktop viewport (>=1200), the user sees the persistent drawer with labeled nav items.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/app-shell.desktop.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-020, L2-021, L2-030
  // Description: Desktop (>=1200) shows the labeled drawer; bottom nav and rail are hidden.
  ```
  Scenarios at 1440×900:
  1. Visiting `/` shows the drawer with the four primary nav items, each with icon + label.
  2. Drawer is visible; bottom nav and rail are not.
  3. Clicking the drawer's `Rewards` item navigates to `/rewards`.
  4. The main content area is constrained to `--hg-size-content-max`.
- Run; confirm RED.

## Implementation outline

- Extend the viewport signal to return `drawer` for `>=1200`.
- Render `<hg-navigation-bar [variant]="'drawer'">` when `viewport() === 'drawer'`.
- Constrain main content with `max-width: var(--hg-size-content-max)` and center.
- Hide bottom nav and rail at this breakpoint.

## Definition of Done

- Playwright spec green at 1440×900.
- Lint, build, unit tests pass.
- **UI design inspection:** at 1280, 1440, and 1920 widths, compare against `v4ZmZr` `hdDrawer` — verify drawer width, item padding, label type, icon alignment, active state, and that content does not stretch past 72rem (`--hg-size-content-max`).
