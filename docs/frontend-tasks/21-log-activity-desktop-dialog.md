---
status: Complete
---

# Task 21 — Log activity (tablet/desktop dialog)

**Traces to:** L2-005, L2-016, L2-020, L2-021
**Design references:** `Tablet / Create goal / 768` (`yXilr`) and `Desktop / Create goal modal / 1440` (`CvfKW`) variant for log activity.
**User value:** On tablet/desktop, the same log-activity flow opens as a centered dialog.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/activity-log-desktop.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-005
  // Description: Tablet/desktop users log activity via a Material dialog; the entry persists.
  ```
  Scenarios at 1440×900:
  1. Triggering "Log activity" opens a centered dialog (560px wide).
  2. Submit persists and closes; focus returns to trigger.
  3. Esc closes the dialog without submitting.
- Run; confirm RED.

## Implementation outline

- Reuse the form from task 20.
- Switch container by viewport signal — `MatBottomSheet` on `bottom`; `MatDialog` on `rail`/`drawer`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 768 and 1440 match `yXilr` and `CvfKW` for size, shadow (`#00000040` blur 24, offset 0/8), and padding.
