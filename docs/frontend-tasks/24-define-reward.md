# Task 24 — Define reward (goal-target and streak-milestone)

**Traces to:** L2-009, L2-016
**Design references:** `Screens / Rewards` (`XmDRo`); reward form composed in dialog `xebkN` style.
**User value:** The user defines a reward bound to either a goal target met or a streak milestone.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/RewardFormPage.ts` with `setName()`, `setDescription()`, `selectCondition(type)`, `setMilestone(n)`, `selectGoal(name)`, `submit()`.
- Add `frontend/e2e/specs/reward-create.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-009
  // Description: User defines a reward with a valid condition; submission without a condition fails validation.
  ```
  Scenarios (mocked POST `/api/goals/{goalId}/rewards`):
  1. Goal-target condition succeeds.
  2. Streak-milestone condition with N >= 1 succeeds.
  3. Missing condition surfaces a validation error.
- Run; confirm RED.

## Implementation outline

- Add `domain/rewards/` feature with `reward-form.component.*`, `rewards.service.*` + contract, `rewards.providers.ts`, `rewards.routes.ts`.
- `IRewardsService.createReward(goalId, input)`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** form dialog matches design at 360/768/1440; condition selector affordance is clear.
