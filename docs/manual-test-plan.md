# HealthQuest Manual Test Plan

Source mocks: `docs/mocks/manifest.json`, page mocks in `docs/mocks/*.html`, component mocks in `docs/mocks/components`, and domain mocks in `docs/mocks/domain`.

## Environment

- Backend: run `dotnet run --project backend/src/HealthGame.Api/HealthGame.Api.csproj --launch-profile http`; expected API base URL is `http://localhost:5224`.
- Frontend: run from `frontend` with `npm run start -- --host=127.0.0.1 --port=4410`.
- Database: SQL Server Express database `HealthGameE2E` on `.\SQLEXPRESS` for automated E2E verification, or the configured manual-test database for exploratory passes.
- Automated SQL Express backend setting: `ConnectionStrings__HealthGame=Server=.\SQLEXPRESS;Database=HealthGameE2E;Trusted_Connection=True;TrustServerCertificate=True`.
- Authentication: use a valid local OIDC/JWT setup for authenticated API calls. If password sign-in is not available, validate auth persistence through the configured identity provider or mark the auth case blocked.
- Test data: use a dedicated manual-test user; do not reuse production-like accounts.

## Ten-Pass Protocol

Run this plan 10 times. For each pass, record browser, viewport, test user, backend commit, frontend commit, database name, defects found, fixes applied, and retest result. Start each pass with a clean test user or delete prior rows for that user from `Goals`, `ActivityEntries`, `Rewards`, and `UserProfiles`.

Required viewports per pass:

- Mobile: 360 x 780
- Tablet: 768 x 1024
- Desktop: 1440 x 900

## Smoke And Structure

For every route below, verify the route renders the expected `data-screen`, the screen title id matches the mock, and there is no app-owned screen implementation under `frontend/projects/the-health-game/src/app` beyond routing/bootstrap.

| Route | Expected screen |
| --- | --- |
| `/onboarding` | `data-screen="onboarding"` |
| `/sign-in` | `data-screen="sign-in"` |
| `/register` | `data-screen="create-account"` |
| `/password-reset` | `data-screen="reset-password"` |
| `/auth/callback`, `/auth/signed-out` | `data-screen="session-states"` |
| `/home` | `data-screen="dashboard"` |
| `/goals` | `data-screen="goals-list"` or empty state when no goals exist |
| `/goals/empty` | `data-screen="goals-empty"` |
| `/goals/new`, `/goals/:id/edit` | `data-screen="goal-form"` |
| `/goals/:id` | `data-screen="goal-detail"` |
| `/goals/:id/delete` | `data-screen="goal-delete"` |
| `/activity/log`, `/activity/log-dialog` | log activity sheet/dialog |
| `/activity/edit`, `/activity/delete`, `/activity/discard-changes` | activity edit/delete/discard dialogs |
| `/rewards`, `/rewards/new`, `/rewards/:id/edit` | rewards list/form |
| `/stats` | `data-screen="stats"` |
| `/profile`, `/account/delete` | profile/account delete |
| `/admin` | `data-screen="admin-error-states"` |

## Component Parity

For each component in `docs/mocks/components`, compare the live component usage against the mock at component level: element order, ARIA labels, active classes, button variants, field labels, chip/pill placement, and responsive layout.

- `action-button`: primary, ghost, notification icon, destructive icon.
- `activity-list-item`: activity text, leading marker, edit action, delete action.
- `app-brand`: compact and large HealthQuest mark/name.
- `app-top-bar`: skip link, brand, status pill, notification button.
- `empty-state`: centered headline, copy, primary recovery action.
- `goal-card`: title, cadence/target copy, action, progress row, streak chips, reward chip.
- `health-text-field`: label, text input, numeric input, select, helper/error states.
- `metric-card`: value, label, tone variants.
- `navigation-bar`: Home/Goals/Rewards/Profile, active state, bottom/rail/drawer/tab variants.
- `page-header`: eyebrow, h1, description, primary action.
- `reward-card`: state, status, progress, earned treatment.
- `section-header`: title row, supporting note/action.
- `segmented-filter`: active/inactive buttons for goal/status/time filters.
- `status-banner`: offline/success/error semantics.
- `streak-summary`: current/best streak labels and values.
- `user-avatar`: initials fallback and profile metadata.
- `week-strip`: seven day cells and complete/current states.

## Major Flows

Onboarding and auth:

- `/onboarding`: `Get started` navigates to registration or first setup; `I have an account` navigates to sign-in.
- `/sign-in`: username/email, password, `Sign in`, `Continue with SSO`, invalid credentials, disabled/deleted account neutral error, keyboard submit, and session token storage.
- `/register`: create account fields, validation, duplicate email, successful user creation, transition to signed-in home.
- `/password-reset`: email field, `Send reset link`, neutral success for known/unknown accounts.
- Session states: callback loading `Cancel`, signed-out `Back to sign in`, expired token `Sign in again`.

Dashboard:

- `/home`: top navigation, notification button, `New goal`, `Log walk`, each goal-card `Log`, metrics, rewards summary, week chart.
- Verify dashboard values refresh after creating a goal, logging activity, and claiming a reward.

Goals:

- Empty state: `Create first goal` opens goal form.
- List: search, sort, `All/Daily/Weekly/Custom`, `New goal`, every goal `Open`.
- Create/edit form: name, target quantity, target unit, Hourly/Daily/Weekly/Monthly/Custom cadence, custom interval, reward name, `Cancel`, `Create goal` or save.
- Detail: `Log`, Activity history `Log`, edit activity icon, delete activity icon, visible streak/reward/progress data.
- Delete: `Cancel` closes without change; `Delete` removes or soft-deletes the goal and returns to list/empty state.

Activities and dialogs:

- Mobile log sheet: fields, `Cancel`, `Log`, soft-keyboard layout, persisted activity.
- Desktop log dialog: fields, `Cancel`, `Log`, persisted activity.
- Edit activity dialog: update quantity/notes/date, `Cancel`, `Save`, recomputed streaks.
- Delete activity dialog: `Cancel`, `Delete`, activity removed/soft-deleted and streaks recomputed.
- Discard changes dialog: dirty form opens prompt; `Keep editing` returns; `Discard` drops draft.

Rewards:

- List: `New reward`, claim hero `Claim`, filters `All/Ready/In progress/Earned/Locked`, earned toast `View`.
- Form: select goal, reward name, description, condition type, streak milestone/target, `Cancel`, `Create reward`.
- Edit reward: load existing values, save changes, persist after reload.
- Claim: ready reward moves to earned state and database `IsEarned`/`EarnedAtUtc` update.

Stats:

- `/stats`: `Week/Month/Year` filters, chart bars, aggregate cards, UTC synced pill.
- Verify stats update after logging, editing, and deleting activities.

Profile and admin:

- `/profile`: display avatar, display name, email, role chips, `Sign out`.
- Edit profile: display name/email fields, `Cancel`, `Save`, persisted profile after reload.
- Delete account dialog: requires email confirmation, `Cancel`, `Delete`, account soft-deleted and session cleared.
- `/admin`: admin controls visible for admin role, hidden for user role, loading state, error state, `Manage roles`, `Retry`.

## Button Inventory

Each pass must click every visible button in the relevant state and verify result, disabled/loading behavior, focus return, and no console errors:

- Global: notification, skip links, Home, Goals, Rewards, Profile.
- Auth: Get started, I have an account, Sign in, Continue with SSO, Create account, Send reset link, Cancel, Back to sign in, Sign in again.
- Dashboard/goals: New goal, Log walk, Log, Create first goal, All, Daily, Weekly, Custom, Open, Hourly, Monthly, Cancel, Create goal, Delete.
- Activity dialogs: Log, Save, Delete, Keep editing, Discard.
- Rewards: New reward, Claim, All, Ready, In progress, Earned, Locked, View, Create reward.
- Stats: Week, Month, Year.
- Profile/admin: Sign out, Save, Delete, Manage roles, Retry.

## Database Persistence Checks

After each UI action, verify by API response, page reload, and direct database query. Use the authenticated test user's subject/user id in every query.

Suggested SQL checks:

```sql
SELECT Id, UserId, Name, TargetQuantity, TargetUnit, DeletedAtUtc
FROM Goals
WHERE UserId = @UserId
ORDER BY CreatedAtUtc DESC;

SELECT Id, GoalId, UserId, Quantity, Notes, DeletedAtUtc
FROM ActivityEntries
WHERE UserId = @UserId
ORDER BY OccurredAtUtc DESC;

SELECT Id, GoalId, UserId, Name, IsEarned, EarnedAtUtc
FROM Rewards
WHERE UserId = @UserId
ORDER BY CreatedAtUtc DESC;

SELECT Id, SubjectId, DisplayName, Email, DeletedAtUtc
FROM UserProfiles
WHERE SubjectId = @SubjectId;
```

Persistence acceptance criteria:

- Create goal inserts one non-deleted `Goals` row and the goal appears after reload.
- Edit goal updates the same `Goals.Id`, not a new row.
- Delete goal sets `DeletedAtUtc` or removes the row according to backend contract and hides it from list/detail.
- Log activity inserts one `ActivityEntries` row tied to the selected `GoalId`.
- Edit activity updates the same `ActivityEntries.Id`.
- Delete activity sets `DeletedAtUtc` or removes the row and updates stats/streaks.
- Create reward inserts one `Rewards` row tied to the selected goal.
- Claim reward updates `IsEarned = 1` and `EarnedAtUtc IS NOT NULL`.
- Profile save updates `UserProfiles.DisplayName` and `Email`.
- Account delete sets `UserProfiles.DeletedAtUtc` or removes the profile according to backend contract.

## Pass Record

For each of the 10 passes, record:

- Pass number:
- Date/time:
- Browser/viewport:
- Backend URL and status:
- Frontend URL and status:
- Test user:
- Seed/cleanup completed:
- Routes checked:
- Buttons checked:
- Dialogs checked:
- Database checks completed:
- Defects:
- Fixes:
- Retest result:

## Current Execution Notes

Automated frontend smoke loop run on May 13, 2026:

- Frontend URL: `http://127.0.0.1:4310`
- Specs: `frontend/e2e/specs/environment-config.spec.ts` and `frontend/e2e/specs/mock-app-routing.spec.ts`
- Result: 10 consecutive passes, 4 tests per pass, 40/40 passed.
- Coverage: route composition, mock screen rendering, app-owned shell removal, and local API base URL exposure.

Backend execution status on May 13, 2026:

- .NET SDK `10.0.101` was installed locally for the repository SDK policy.
- Backend URL: `http://localhost:5224`.
- Frontend URL: `http://127.0.0.1:4410`.
- SQL Express database: `HealthGameE2E` on `.\SQLEXPRESS`.
- Automated E2E spec: `e2e/tests/major-behaviours.spec.ts`, using the page object in `e2e/pages/HealthGameE2EPage.ts`.
- Result: the real frontend persisted profile, goal, activity, and reward changes through the real backend into SQL Express, including soft-delete checks.
