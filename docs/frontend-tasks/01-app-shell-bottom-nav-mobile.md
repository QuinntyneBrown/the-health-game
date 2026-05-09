# Task 01 — Mobile bottom navigation

**Traces to:** L2-020, L2-021, L2-030
**Design references:** `docs/ui-design.pen` — `Mobile / Home / 360` (`S2m3bU`), `Mobile / Goals / 360` (`a5rXG`), navigation bar component `Sn0aM`.
**User value:** On a phone-sized viewport, the user sees a Material-spec bottom navigation bar so they can move between Home, Goals, Rewards, and Profile.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/AppShellPage.ts` with methods: `gotoHome()`, `bottomNavigation()`, `bottomNavItem(label)`, `isBottomNavVisible()`, `isRailVisible()`, `isDrawerVisible()`, `clickBottomNavItem(label)`.
- Add `frontend/e2e/specs/app-shell.mobile.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-020, L2-021, L2-030
  // Description: Mobile (<768) shows the Material bottom nav and hides the rail/drawer.
  ```
  Scenarios (Pixel 5 device emulation):
  1. Visiting `/` shows the bottom navigation with items `Home`, `Goals`, `Rewards`, `Profile`.
  2. Bottom nav is visible; rail and drawer are not.
  3. Tapping `Goals` navigates to `/goals`.
- Run; confirm RED before any production change.

## Implementation outline

- Replace the navigation markup in `app.html` with `<hg-navigation-bar [variant]="'bottom'">` from `components`.
- Add a `viewport.signal.ts` (small `BreakpointObserver` wrapper) returning `bottom | rail | drawer` — for this task, hardcode `bottom` until tasks 02 and 03 introduce the others.
- Bind `items` from a constant `NAV_ITEMS` (`home`, `goals`, `rewards`, `profile`).
- Bind `activeItemId` from the current router URL (use `inject(Router).events`).
- Wire `(itemSelected)` to `Router.navigate`.
- Use `--hg-z-toolbar` and existing tokens; no hex/px in styles.

## Definition of Done

- The Playwright spec is green at Pixel 5 emulation.
- Unit tests for the viewport signal pass.
- `npm run lint`, `npm run build`, and unit suite pass.
- **UI design inspection:** run `npm run start`; open Chrome DevTools at 360×780; visually compare against `S2m3bU` and `a5rXG`. Verify bottom-nav height, item spacing, label typography, icon size (`--hg-icon-size-md`), active-item indicator, surface color, and elevation match the design. Resolve any deviation before closing the task.
- File-per-type, BEM, OnPush, Material-only, tokens-only preserved.
