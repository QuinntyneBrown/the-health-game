---
status: Complete
---

# Task 19 — Delete goal with confirmation

**Traces to:** L2-004
**Design references:** Dialog `xebkN`; goal detail destructive action.
**User value:** The user can delete a goal after explicit confirmation; the goal disappears from their list.

## ATDD — Failing Playwright test (POM) first

- Extend `GoalDetailPage.ts` with `clickDelete()`, `confirmDelete()`, `cancelDelete()`.
- Add `frontend/e2e/specs/goal-delete.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-004
  // Description: Deleting a goal requires explicit confirmation, removes the goal, and returns to the list.
  ```
  Scenarios (mocked DELETE `/api/goals/{id}`):
  1. Clicking Delete opens the confirmation dialog.
  2. Cancel keeps the goal.
  3. Confirm calls DELETE and navigates back to `/goals`; the deleted item is no longer listed.
- Run; confirm RED.

## Implementation outline

- `MatDialog` confirmation pattern.
- `IGoalsService.deleteGoal(id)`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** dialog matches `xebkN`; destructive button styling (Material warning tones) consistent across breakpoints.
