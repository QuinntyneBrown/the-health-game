# Test Plans

Per-page test plans for the application. Each plan is grounded in:
- the design source (`docs/ui-design.pen`),
- the L2 detailed requirements (`docs/specs/L2.md`),
- the per-task work in `docs/frontend-tasks/`.

Each plan covers: typography, color, layout & spacing, responsive design,
functional flows, behavior (focus / keyboard / motion), accessibility, data
persistence, and performance, with explicit links back to L2 acceptance
criteria.

## Pages

| # | Page | Folder |
|---|------|--------|
| 01 | Onboarding | [01-onboarding](./01-onboarding/test-plan.md) |
| 02 | Home Dashboard | [02-home-dashboard](./02-home-dashboard/test-plan.md) |
| 03 | Goals — list, detail, create | [03-goals](./03-goals/test-plan.md) |
| 04 | Log Activity & Create Goal | [04-log-activity-and-create-goal](./04-log-activity-and-create-goal/test-plan.md) |
| 05 | Rewards — list, claim, create | [05-rewards](./05-rewards/test-plan.md) |
| 06 | Stats & Profile | [06-stats-and-profile](./06-stats-and-profile/test-plan.md) |

## Conventions

- Test case IDs use the format `TC-<group>-<NNN>` where `<group>` is a
  short letter code: V (visual / typography), C (color), L (layout &
  spacing), R (responsive), F (functional), B (behavior), A
  (accessibility), D (data persistence), S (security), P (performance).
- Each plan declares its preconditions and exit criteria explicitly. A
  plan is not considered passed until every TC under it passes.
- Where a plan asserts a token-level value (color hex, type size,
  spacing), the canonical source is the design tokens frame in
  `docs/ui-design.pen`. If a token changes there, update the
  corresponding TC values across plans.
