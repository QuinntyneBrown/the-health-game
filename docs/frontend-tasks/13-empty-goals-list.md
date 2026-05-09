---
status: Complete
---

# Task 13 — Empty goals list

**Traces to:** L2-002, L2-020, L2-021
**Design references:** `Screens / Goals` (`z8Iy1o`) `a5rXG`/`BVNJa`/`rPVHK`; empty state in `Yvsng`.
**User value:** A signed-in user with no goals lands on `/goals` and sees a friendly empty state pointing them to create their first goal.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/GoalsListPage.ts` with `emptyState()`, `clickCreateGoal()`, `goalCards()`.
- Add `frontend/e2e/specs/goals-list-empty.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-002
  // Description: An empty goals list renders the empty-state CTA.
  ```
  Scenarios (mocked `GET /api/goals` → `[]`):
  1. `/goals` shows `<hg-empty-state>` with message and a "Create goal" CTA.
  2. Clicking the CTA navigates to `/goals/new`.
- Run; confirm RED.

## Implementation outline

- Add `domain/goals/` feature with `goal-list.component.*`, `goals.service.*` + contract, `goals.providers.ts`, `goals.routes.ts`.
- Lazy-load `GOALS_ROUTES` in `app.routes.ts`.
- Use `<hg-empty-state>` for zero results.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** compare empty state against the `Empty` group in `Yvsng` for icon frame size (`--hg-size-empty-icon-frame`), copy, and CTA placement at 360/768/1440.
