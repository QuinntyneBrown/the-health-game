---
status: Accepted
---

# Task 18 — Edit goal

**Traces to:** L2-003, L2-016
**Design references:** same form as task 14 (`eUU4f`) reused.
**User value:** The user can update an existing goal's name, description, target, and cadence; the detail reflects the change.

## ATDD — Failing Playwright test (POM) first

- Extend `GoalDetailPage.ts` with `clickEdit()`.
- Add `frontend/e2e/specs/goal-edit.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-003
  // Description: Editing a goal updates its detail and shows a cadence-change note when cadence changes.
  ```
  Scenarios (mocked PUT `/api/goals/{id}`):
  1. Updating name and target persists and reflects on detail.
  2. Changing cadence shows an inline note: "Streak windows recompute from now; existing entries kept."
  3. Submitting an invalid form keeps the user on the form with field errors.
- Run; confirm RED.

## Implementation outline

- Reuse `goal-form.component` in edit mode (`goals/:id/edit`).
- `IGoalsService.updateGoal(id, input)`.
- Pre-fill form from `IGoalsService.getGoal(id)`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** verify field-prefilled state, save/cancel placement, and breakpoints match design.
