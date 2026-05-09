---
status: Accepted
---

# Task 27 — Dashboard from real API data

**Traces to:** L2-002, L2-008, L2-010, L2-020
**Design references:** `Screens / Home Dashboard` (`yoFEo`) — `S2m3bU`/`n7P1LI`/`v4ZmZr`.
**User value:** The dashboard renders the user's actual goals, metrics, and rewards instead of mock data.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/DashboardPage.ts` with `metricCards()`, `goalCards()`, `rewardCards()`.
- Add `frontend/e2e/specs/dashboard-real-data.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-002, L2-008, L2-010
  // Description: The dashboard composes real goals and rewards data from the API.
  ```
  Scenarios (mocked GET `/api/goals` and `/api/rewards`):
  1. Metric cards reflect counts derived from the API responses.
  2. Goal cards and reward cards render from the API responses.
- Run; confirm RED.

## Implementation outline

- Refactor `DashboardService` to consume `IGoalsService.getGoals()` and `IRewardsService.getRewards()` instead of the mock summary.
- Remove or trim the placeholder `getGoalSummaries()` once unused.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** confirm header, metric cards (tones: primary/streak/reward), goal/reward grids match `S2m3bU`/`n7P1LI`/`v4ZmZr` at 360/768/1440.
