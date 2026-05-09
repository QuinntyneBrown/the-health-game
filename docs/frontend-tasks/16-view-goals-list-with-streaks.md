---
status: Accepted
---

# Task 16 — View goals list with streaks

**Traces to:** L2-002, L2-008, L2-020
**Design references:** `Screens / Goals` (`z8Iy1o`) — `a5rXG`/`BVNJa`/`rPVHK`; `<hg-goal-card>` `d53Gh`.
**User value:** The user sees their goals as cards with cadence, progress, and current/longest streak.

## ATDD — Failing Playwright test (POM) first

- Extend `GoalsListPage.ts` with `goalCardByName(name)`, `currentStreakLabel(name)`, `longestStreakLabel(name)`.
- Add `frontend/e2e/specs/goals-list-streaks.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-002, L2-008
  // Description: Each goal card shows cadence, progress, and current/longest streak.
  ```
  Scenarios (mocked GET `/api/goals` with three goals including streak fields):
  1. Each card renders name, cadence label, progress label, current streak, longest streak.
  2. The cadence segmented filter narrows visible cards.
- Run; confirm RED.

## Implementation outline

- `IGoalsService.getGoals()` returns `GoalListItem[]` including `streakSummary`.
- `goal-list.component` renders `<hg-segmented-filter>` and `<hg-goal-card>` per item.
- View model produced by `GoalsFeatureService.getList()`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 360/768/1440 compare card layout, chip styles, progress bar color, streak label typography, and grid wrapping against `a5rXG`/`BVNJa`/`rPVHK`.
