---
status: Complete
---

# Task 26 — Reward-earned in-app notification

**Traces to:** L2-010, L2-021
**Design references:** Snackbar `Y0n6fU`; banner `m203bZ`.
**User value:** When the user logs activity that satisfies a reward, an in-app banner/snackbar surfaces the new earning.

## ATDD — Failing Playwright test (POM) first

- Extend `LogActivitySheet.ts` with `expectRewardEarnedToast(name)`.
- Add `frontend/e2e/specs/reward-earned.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-010
  // Description: Logging an activity that triggers a reward shows an in-app reward-earned notification.
  ```
  Scenarios (mocked POST activity that returns `newlyEarnedRewards: [...]`):
  1. After successful log, a snackbar/banner shows the earned reward name.
  2. The rewards list shows the reward as earned with today's date.
- Run; confirm RED.

## Implementation outline

- Extend `IActivitiesService.logActivity` response to include `newlyEarnedRewards` (mirrors backend evaluation in `docs/backend-completion-plan.md` workstream 5).
- Use `MatSnackBar` for the toast; route to `/rewards` from the snackbar action.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** snackbar matches `Y0n6fU` (color, icon, position, auto-dismiss timing) at 360/768/1440.
