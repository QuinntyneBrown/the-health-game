# Frontend

Angular workspace for HealthQuest.

## Workspace Pattern

- `projects/api` owns backend-facing models and services. Consumed services expose a sibling `*.service.contract.ts` file with an interface and `InjectionToken`.
- `projects/components` owns reusable UI-only Angular Material components. It must not import `api` or `domain`.
- `projects/domain` owns feature/domain UI. It may import `api` contracts and reusable `components`.
- `projects/the-health-game` is the app shell. Routes lazy-load feature routes from `domain`.

## UI Pattern

- Components are file-per-type: `.ts`, `.html`, and `.scss`.
- HTML and SCSS classes use BEM naming.
- UI primitives use Angular Material or a wrapper around Angular Material.
- Component styles consume design tokens from `projects/the-health-game/src/styles.scss`; do not hard-code colors or spacing inside component styles.

## Components Library Catalog

`projects/components` is presentation-only and does not import `api` or `domain`.

- Shell and navigation: `AppBrandComponent`, `AppTopBarComponent`, `NavigationBarComponent`
- Actions and forms: `ActionButtonComponent`, `SegmentedFilterComponent`, `HealthTextFieldComponent`
- Layout headers: `PageHeaderComponent`, `SectionHeaderComponent`
- Health-game display blocks: `MetricCardComponent`, `GoalCardComponent`, `RewardCardComponent`, `ActivityListItemComponent`, `StreakSummaryComponent`, `WeekStripComponent`
- Utility presentation: `StatusBannerComponent`, `EmptyStateComponent`, `UserAvatarComponent`

## Commands

```bash
npm run build
npm run test
npm run start
```

`build`, `test`, and `start` build the libraries first because workspace imports resolve through package entry points in `dist/`.
