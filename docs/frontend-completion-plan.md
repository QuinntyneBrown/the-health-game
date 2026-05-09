# Frontend Completion Plan

This plan covers frontend code only. It is bounded by the existing requirements in `docs/specs/L1.md` and `docs/specs/L2.md`, the conventions in `docs/technology-guidance-and-practices.md`, the screens defined in `docs/ui-design.pen`, and the established patterns already in `frontend/projects/`.

The plan is delivered as a set of small, vertically-sliced tasks. Each task lives in its own markdown file under `docs/frontend-tasks/`. Every task is built ATDD-first: the first step is a failing Playwright test using the Page Object Model. Every task's Definition of Done includes a manual UI inspection of the running browser at the relevant breakpoints to confirm the implementation matches `docs/ui-design.pen`.

## Scope Guard

Complete the frontend without expanding product scope.

- Do not add features that are not traceable to existing L1/L2 requirements.
- Do not add a frontend BFF, GraphQL layer, or state-management framework (NgRx, Akita, etc.). Use Angular signals + services as already established.
- Do not introduce a CSS framework (Tailwind, Bootstrap, etc.). Stay on Angular Material + design tokens + BEM.
- Do not introduce a different component library or replace the 16 presentation components already in `projects/components`.
- Do not switch to single-file Angular components, inline templates, or inline styles.
- Do not bypass the interface-driven service consumption pattern (`*.service.contract.ts` + `InjectionToken`).
- Do not violate library dependency rules: `components` cannot depend on `api` or `domain`; `domain` may depend on `api` and `components`; only the application depends on all three.
- Do not hard-code colors, spacing, radii, font sizes, or shadows in component styles. Reference `--hg-*` tokens or `--mat-sys-*` variables.
- Do not build a custom auth server. The frontend performs the OIDC PKCE authorization code flow against an external OIDC provider.
- Do not add additional Angular workspace projects beyond `api`, `components`, `domain`, and `the-health-game`.

## Current Frontend Baseline

Workspace layout (`frontend/projects/`):

- `api/` — `provideApiServices`, a stub `GoalsService` returning hardcoded `GoalSummary` data via `IGoalsService` + `GOALS_SERVICE`, and the `GoalSummary` / `GoalCadence` / `GoalTarget` models.
- `components/` — 16 reusable presentation components, all OnPush, file-per-type, BEM-named, Material-based:
  `action-button`, `activity-list-item`, `app-brand`, `app-top-bar`, `empty-state`, `goal-card`, `health-text-field`, `metric-card`, `navigation-bar`, `page-header`, `reward-card`, `section-header`, `segmented-filter`, `status-banner`, `streak-summary`, `user-avatar`, `week-strip`.
- `domain/` — a single `dashboard` feature with `DashboardOverviewComponent`, `DashboardService`, contract, providers, route, and overview model.
- `the-health-game/` — application shell with Angular Material theme, design tokens in `styles.scss`, lazy-loaded dashboard route, placeholder navigation containing only "Today".

Implemented frontend slice: `/` — Dashboard overview rendered from in-memory mock data.

UI design (`docs/ui-design.pen`) defines six screen families plus shared states, each with mobile (360), tablet (768), and desktop (1440) layouts:

- Onboarding (`Xxdwc`)
- Home Dashboard (`yoFEo`)
- Goals (`z8Iy1o`)
- Log Activity & Create Goal (`eUU4f`)
- Rewards (`XmDRo`)
- Stats & Profile (`LH8l2`)
- Notifications, Errors, Dialogs, Empty, Loading states (`Yvsng`)

## Established Patterns To Preserve

### Workspace and libraries

- Keep one Angular workspace, one application, three libraries (`api`, `components`, `domain`).
- Keep dependency direction: `api` ← `domain` ← application; `components` ← `domain`, application; `components` does not depend on `api`.
- Keep public API surfaces (`public-api.ts`) curated.
- Each library exposes a `provide*Services()` returning `EnvironmentProviders`.

### Components library

- Each component is `ChangeDetectionStrategy.OnPush`, file-per-type (`.ts`/`.html`/`.scss`), BEM-named, built on Angular Material primitives.
- Inputs use `input()` / `input.required()`; outputs use `output()`; no `@Input` / `@Output` decorators.
- Components are pure presentation: no service injection, no HTTP, no router. Inputs in, outputs out.
- Material Symbols (rounded) for icons.
- Color, spacing, radius, font, shadow values from `--hg-*` tokens or `--mat-sys-*` variables only.

### Domain library

- Each feature lives under `projects/domain/src/lib/<feature>/` with: routed component(s), feature view model, feature orchestration service + contract, `provide<Feature>Services()`, and `<FEATURE>_ROUTES` exported through `public-api.ts`.
- Feature components inject domain services via the injection token.
- Domain services consume API services via injection tokens.
- Domain services produce labels and view models so components stay presentational.
- Use `toSignal()` with a non-null `initialValue` (preserve the pattern in `DashboardOverviewComponent`).

### API library

- One folder per backend concern (`goals/`, `activities/`, `rewards/`, `users/`, `auth/`).
- Each service has a sibling `*.service.contract.ts` exporting an interface and `InjectionToken<I*Service>`.
- Models live in `models/`.
- Services return `Observable<T>` with `readonly` collections.
- `provideApiServices()` registers every API service via `useClass` against its injection token.
- Backend contract surface that `api/` mirrors (per `docs/backend-completion-plan.md`):
  - `POST/GET /api/goals`, `GET/PUT/DELETE /api/goals/{id}`
  - `GET/POST /api/goals/{goalId}/activities`, `PUT/DELETE /api/goals/{goalId}/activities/{activityEntryId}`
  - `GET /api/rewards`, `GET/POST /api/goals/{goalId}/rewards`
  - `GET/PUT/DELETE /api/users/me`

### Application

- Configure providers in `appConfig.providers`. Use `makeEnvironmentProviders` for new feature provider bundles.
- Routes lazy via `loadChildren: () => import('domain').then(m => m.<FEATURE>_ROUTES)`.
- Application shell composes layout, nav, and outlet only.

## ATDD And Design Verification — How Every Task Is Built

Every task in this plan is implemented in this order:

1. **Write the failing Playwright acceptance test first.** The test lives under `frontend/e2e/specs/` and uses Page Objects under `frontend/e2e/pages/`. The test file starts with the traceability header:

   ```ts
   // Acceptance Test
   // Traces to: L2-NNN[, L2-NNN...]
   // Description: ...
   ```

   No `page.locator(...)` appears in the spec file — only Page Object method calls.

2. **Run the test and confirm it fails** with a clear missing-behavior error before any production code is written.

3. **Implement the smallest production code** that makes the test pass while respecting every Established Pattern above.

4. **Run unit tests** for any new service or component; add specs as needed.

5. **Run the failing Playwright test until green.**

6. **Inspect the running UI in a real browser.** Open `npm run start`, navigate to the affected route at the breakpoints relevant to the task (mobile 360, tablet 768, desktop 1440 minimum — match the design frames), and visually compare each viewport against the corresponding `docs/ui-design.pen` frame. Capture differences (spacing, color, type, alignment, iconography, radius, focus states, hover states) and resolve them before marking the task done.

7. **Run lint, type-check, and production build** to confirm budgets and module boundaries pass.

A task is not done until the Playwright test is green, the unit tests are green, the build/lint pass, and the running browser matches the design at every required breakpoint.

## Vertically Sliced Task List

Each task is small, end-to-end, and shippable on its own. Tasks are listed in recommended execution order. Each link points to the task's own markdown file with full ATDD steps, design references, implementation outline, and Definition of Done.

Foundation:

- [01 — Mobile bottom navigation](./frontend-tasks/01-app-shell-bottom-nav-mobile.md)
- [02 — Tablet rail navigation](./frontend-tasks/02-app-shell-rail-tablet.md)
- [03 — Desktop drawer navigation](./frontend-tasks/03-app-shell-drawer-desktop.md)
- [04 — Environment configuration and API base URL](./frontend-tasks/04-environment-config-and-api-base-url.md)
- [05 — HttpClient and ProblemDetails error mapping](./frontend-tasks/05-http-client-and-error-mapping.md)

Authentication:

- [06 — OIDC sign-in redirect flow](./frontend-tasks/06-oidc-sign-in-flow.md)
- [07 — OIDC callback handling and token attachment](./frontend-tasks/07-oidc-callback-and-token-attach.md)
- [08 — Sign-out flow](./frontend-tasks/08-sign-out-flow.md)
- [09 — `authGuard` on protected routes](./frontend-tasks/09-auth-guard-protect-routes.md)

Profile:

- [10 — View current user profile](./frontend-tasks/10-view-profile.md)
- [11 — Edit display name and email](./frontend-tasks/11-edit-profile-name-and-email.md)
- [12 — Delete account](./frontend-tasks/12-delete-account.md)

Goals:

- [13 — Empty goals list](./frontend-tasks/13-empty-goals-list.md)
- [14 — Create daily goal](./frontend-tasks/14-create-daily-goal.md)
- [15 — Create hourly, weekly, monthly, custom goals](./frontend-tasks/15-create-cadence-variants.md)
- [16 — View goals list with streaks](./frontend-tasks/16-view-goals-list-with-streaks.md)
- [17 — View goal detail](./frontend-tasks/17-view-goal-detail.md)
- [18 — Edit goal](./frontend-tasks/18-edit-goal.md)
- [19 — Delete goal with confirmation](./frontend-tasks/19-delete-goal.md)

Activities:

- [20 — Log activity (mobile bottom sheet)](./frontend-tasks/20-log-activity-mobile-sheet.md)
- [21 — Log activity (tablet/desktop dialog)](./frontend-tasks/21-log-activity-desktop-dialog.md)
- [22 — View chronological activity history](./frontend-tasks/22-view-activity-history.md)
- [23 — Edit and delete activity entries](./frontend-tasks/23-edit-and-delete-activity.md)

Rewards:

- [24 — Define reward (goal-target and streak-milestone)](./frontend-tasks/24-define-reward.md)
- [25 — View rewards list and filter](./frontend-tasks/25-view-rewards-list-and-filter.md)
- [26 — Reward-earned in-app notification](./frontend-tasks/26-reward-earned-notification.md)

Dashboard wiring:

- [27 — Dashboard from real API data](./frontend-tasks/27-dashboard-from-real-api.md)

RBAC:

- [28 — RBAC UI gating with `hgIfRole` and `roleGuard`](./frontend-tasks/28-rbac-ui-gating.md)

Cross-cutting polish:

- [29 — Error, empty, and loading states baseline](./frontend-tasks/29-error-empty-loading-states.md)
- [30 — Accessibility (WCAG 2.1 AA) audit pass](./frontend-tasks/30-accessibility-audit.md)
- [31 — Performance budgets and lazy chunks](./frontend-tasks/31-performance-bundle-budgets.md)
- [32 — Module-boundary lint and convention enforcement](./frontend-tasks/32-module-boundary-lint.md)

## Requirement Trace Matrix

| Requirement | Frontend tasks |
| --- | --- |
| L2-001 Create Goal | 14, 15 |
| L2-002 View Goals | 13, 16, 17 |
| L2-003 Edit Goal | 18 |
| L2-004 Delete Goal | 19 |
| L2-005 Log Activity | 20, 21 |
| L2-006 Edit/Delete Activity | 22, 23 |
| L2-007 Compute Streak | 16, 17, 22 (display) |
| L2-008 Display Streaks | 16, 17 |
| L2-009 Define Reward | 24 |
| L2-010 Earn Rewards | 25, 26 |
| L2-011 Standard Cadence | 14, 15 |
| L2-012 Custom Cadence | 15 |
| L2-013 OIDC/PKCE | 06, 07 |
| L2-014 Profile / Account Deletion | 10, 11, 12 |
| L2-015 RBAC | 09, 28 |
| L2-016 Input Validation | 05, 14, 15, 18, 20, 21, 24 |
| L2-017 Secrets/Transport | 04, 06, 07 |
| L2-019 Frontend Bundle/Load | 31 |
| L2-020 Responsive Design | 01, 02, 03, plus per-feature DoD |
| L2-021 Accessibility | 30, plus per-task DoD |
| L2-030 Material/Tokens | per-task DoD |
| L2-031 BEM and File-Per-Type | per-task DoD, 32 enforces |
| L2-032 Interface-Driven Services | per-task DoD, 32 enforces |
| L2-033 Library Layout | 32 enforces |
| L2-035 Playwright POM | every task |

## Definition Of Done For The Plan

The frontend completion work is done when:

- Every task file in `docs/frontend-tasks/` is checked off — Playwright tests green, unit tests green, lint clean, production build clean, browser UI inspected against `docs/ui-design.pen` at each required breakpoint.
- A user can sign in via OIDC PKCE, view their dashboard, manage goals (CRUD), log/edit/delete activities, define and earn rewards, and view/update/delete their profile against the live backend.
- Every API service has a contract file with interface and token; every consumer injects via token only.
- Every new component is OnPush, file-per-type, BEM-named, Material-based, uses only design tokens.
- `components` does not depend on `api` or `domain`; lint enforces it.
- Lighthouse accessibility score is >= 95 on each routed view.
- Production build meets the configured initial JS budget and uses HTTPS-only URLs.
- No secrets, tokens, or PII appear in any console log.
- The implementation stays within the documented frontend requirements and established frontend patterns.
