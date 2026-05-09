---
status: Accepted
---

# Task 23 — Edit and delete activity entries

**Traces to:** L2-006, L2-016, L2-021
**Design references:** activity list item action affordances; dialog `xebkN`.
**User value:** The user can correct or remove a previously logged activity; streaks recompute.

## ATDD — Failing Playwright test (POM) first

- Extend `GoalDetailPage.ts` with `clickEditActivity(index)`, `clickDeleteActivity(index)`, `confirmDeleteActivity()`.
- Add `frontend/e2e/specs/activity-edit-delete.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-006
  // Description: User edits or deletes own activity entries; the list and streak update.
  ```
  Scenarios (mocked PUT/DELETE):
  1. Edit updates the displayed quantity/notes.
  2. Delete (after confirmation) removes the item.
  3. Streak summary updates after either operation.
- Run; confirm RED.

## Implementation outline

- Reuse activity form for edit (modal/sheet by viewport).
- `IActivitiesService.updateActivityEntry`, `deleteActivityEntry`.
- After mutation, re-fetch streak summary on the goal detail.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** edit/delete affordances and confirmation dialog match design at 360/768/1440.
