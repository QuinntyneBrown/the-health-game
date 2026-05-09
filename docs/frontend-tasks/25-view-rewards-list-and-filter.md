---
status: Complete
---

# Task 25 — View rewards list and filter

**Traces to:** L2-010, L2-020, L2-021
**Design references:** `Screens / Rewards` (`XmDRo`) — `I9B6Wj`/`GYENS`/`AoLhs`; `<hg-reward-card>`.
**User value:** The user sees all rewards, can distinguish earned vs pending, and filters by status.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/RewardsListPage.ts` with `filterBy(label)`, `rewardCards()`, `rewardCardByName(name)`, `isEarned(name)`.
- Add `frontend/e2e/specs/rewards-list.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-010
  // Description: Rewards list distinguishes earned and pending and supports a status filter.
  ```
  Scenarios (mocked GET `/api/rewards`):
  1. Earned cards visually distinct (token color + status label) and show earned date.
  2. Filter "Earned" hides pending; "Pending" hides earned.
- Run; confirm RED.

## Implementation outline

- Render `<hg-segmented-filter>` and `<hg-reward-card>` items.
- `IRewardsService.getRewards()`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** card surface colors (`--hg-color-reward-container`, `--hg-color-on-reward-container`), filter chip styles, and grid wrap match design at 360/768/1440.
