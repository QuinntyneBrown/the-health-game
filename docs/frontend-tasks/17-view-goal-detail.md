---
status: Complete
---

# Task 17 — View goal detail

**Traces to:** L2-002, L2-007, L2-008, L2-020
**Design references:** goal detail composition derived from `z8Iy1o` and the design's streak summary.
**User value:** Opening a goal shows its full detail with current and longest streak prominent.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/GoalDetailPage.ts` with `title()`, `descriptionText()`, `currentStreak()`, `longestStreak()`, `editButton()`, `deleteButton()`.
- Add `frontend/e2e/specs/goal-detail.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-002, L2-008
  // Description: Goal detail renders name, description, target, cadence, current/longest streak.
  ```
  Scenarios (mocked GET `/api/goals/{id}`):
  1. All fields render.
  2. Visiting an unknown id renders the not-found view.
- Run; confirm RED.

## Implementation outline

- Add `goal-detail.component.*` rendering `<hg-page-header>`, `<hg-streak-summary>`, schedule/target metadata, and a slot for activity history (filled by task 22).
- Route `goals/:id` lazy-loaded via `GOALS_ROUTES`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 360/768/1440 confirm page header, streak summary card colors (`--hg-color-streak-container` / `--hg-color-on-streak-container`), section spacing.
