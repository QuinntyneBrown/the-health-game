---
status: Complete
---

# Task 15 — Create hourly, weekly, monthly, custom-interval goals

**Traces to:** L2-001, L2-011, L2-012, L2-016
**Design references:** cadence segmented control in `eUU4f`.
**User value:** The user can pick any cadence — hourly, weekly (with week-start), monthly, or custom (every N hours / N days).

## ATDD — Failing Playwright test (POM) first

- Extend `GoalFormPage.ts` with `selectWeekStart(day)`, `setCustomIntervalUnit(unit)`, `setCustomIntervalCount(n)`.
- Add `frontend/e2e/specs/goal-create-cadences.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-001, L2-011, L2-012
  // Description: Each cadence variant is selectable and validated.
  ```
  Scenarios:
  1. Hourly create succeeds with a valid form.
  2. Weekly create reveals the week-start selector and persists the chosen day.
  3. Monthly create succeeds.
  4. Custom create exposes interval count + unit; `count <= 0` surfaces a validation error.
- Run; confirm RED.

## Implementation outline

- Extend `goal-form.component` to conditionally render week-start (weekly only) and custom-interval inputs (custom only).
- Validators: `Validators.min(1)` and `Validators.required` on the conditional fields.

## Definition of Done

- Playwright spec green for all four scenarios.
- **UI design inspection:** verify cadence chip/segment control visuals (selected vs unselected) at 360/768/1440 against `eUU4f`.
