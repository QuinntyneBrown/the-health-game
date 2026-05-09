# Task 14 — Create daily goal

**Traces to:** L2-001, L2-011, L2-016, L2-020, L2-021, L2-030, L2-031
**Design references:** `Screens / Log Activity & Create Goal` (`eUU4f`) — mobile bottom-sheet `aTDUg`, tablet `yXilr`, desktop modal `CvfKW`.
**User value:** The user creates a daily goal with a name, target value/unit, and sees it appear in their goals list.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/GoalFormPage.ts` with `setName()`, `setTargetValue()`, `setTargetUnit()`, `selectCadence(label)`, `submit()`, `expectFieldError(field, message)`.
- Add `frontend/e2e/specs/goal-create-daily.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-001, L2-011
  // Description: User creates a daily goal; it appears in the list with cadence "Daily".
  ```
  Scenarios (mocked POST `/api/goals` then GET `/api/goals`):
  1. Submitting `Hydrate / 8 / cups / Daily` POSTs and navigates to the new goal's detail.
  2. Empty name surfaces a field error.
  3. Non-positive target surfaces a field error.
- Run; confirm RED.

## Implementation outline

- Add `goal-form.component.*` shared by create and edit; reactive form.
- Cadence selector: hourly/daily/weekly/monthly/custom (use `<mat-select>` or chips).
- For this task only daily must work end-to-end; other cadences land in task 15.
- `IGoalsService.createGoal(input)`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 360 inspect the bottom-sheet form against `aTDUg`; at 768 inspect against `yXilr`; at 1440 inspect modal against `CvfKW` (560px wide, padding 32, corner radius 28, dimmer `#0000007A`).
