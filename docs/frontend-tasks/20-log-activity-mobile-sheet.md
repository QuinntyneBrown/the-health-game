---
status: Complete
---

# Task 20 — Log activity (mobile bottom sheet)

**Traces to:** L2-005, L2-016, L2-020, L2-021
**Design references:** `Mobile / Quick log sheet` (`aTDUg`, `Kte7w`).
**User value:** On mobile, the user opens a bottom sheet from the goal detail (or FAB) to log a quantity quickly.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/LogActivitySheet.ts` with `setQuantity()`, `setNotes()`, `submit()`, `cancel()`.
- Add `frontend/e2e/specs/activity-log-mobile.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-005
  // Description: Mobile users open a bottom sheet to log activity; the entry persists.
  ```
  Scenarios (Pixel 5; mocked POST `/api/goals/{goalId}/activities`):
  1. Tapping the FAB opens the bottom sheet.
  2. Submitting valid quantity persists and dismisses the sheet.
  3. Submitting a future timestamp beyond the cadence window surfaces a validation error.
- Run; confirm RED.

## Implementation outline

- Add `domain/activities/` feature with `log-activity-sheet.component.*`, `activities.service.*` + contract, providers.
- Use `MatBottomSheet` on mobile only.
- `IActivitiesService.logActivity(goalId, input)`.
- Client-side cadence-window validator + server-side ValidationError mapping.

## Definition of Done

- Playwright spec green at Pixel 5.
- **UI design inspection:** sheet height, drag handle, padding, dim `#0000007A`, and corner radius match `aTDUg`/`Kte7w`.
