---
status: Complete
---

# Task 22 — View chronological activity history

**Traces to:** L2-005, L2-006, L2-021
**Design references:** `<hg-activity-list-item>` styles; goal detail composition.
**User value:** The goal detail shows logged entries in reverse-chronological order with quantity and notes.

## ATDD — Failing Playwright test (POM) first

- Extend `GoalDetailPage.ts` with `activityListItems()`, `activityItem(index)`.
- Add `frontend/e2e/specs/activity-history.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-005, L2-006
  // Description: Activity entries appear in chronological order on goal detail.
  ```
  Scenarios (mocked GET `/api/goals/{goalId}/activities`):
  1. Three entries render newest-first with quantity and notes.
  2. Empty history renders the empty state.
- Run; confirm RED.

## Implementation outline

- `IActivitiesService.getGoalActivities(goalId)`.
- Render via `<hg-activity-list-item>` inside goal detail (use `@defer` to keep below-the-fold lazy).

## Definition of Done

- Playwright spec green.
- **UI design inspection:** list item height (`--hg-size-list-item`), divider/border, type, and spacing match design at 360/768/1440.
