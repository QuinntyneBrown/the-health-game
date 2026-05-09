# Backend Completion Plan

This plan covers backend code only. It is intentionally limited to the backend requirements already documented in `docs/specs/L1.md`, `docs/specs/L2.md`, and `docs/technology-guidance-and-practices.md`.

## Scope Guard

Complete the backend without adding product scope beyond the existing requirements.

- Do not add frontend implementation work to this plan.
- Do not add features that are not traceable to the existing L1/L2 backend requirements.
- Do not replace the established architecture, solution structure, database choice, or HTTP style.
- Do not add repository or unit-of-work abstractions.
- Do not switch from ASP.NET Core Controllers to Minimal APIs.
- Do not switch from EF Core SQL Server to another primary persistence technology.
- Do not build a custom auth server unless the product explicitly changes direction. The current backend is a resource API that validates JWTs from an OIDC/PKCE flow.

## Current Backend Baseline

The backend already establishes the intended architecture:

- `HealthGame.Domain` contains domain entities and value objects.
- `HealthGame.Application` contains MediatR commands, queries, handlers, DTOs, and abstractions.
- `HealthGame.Infrastructure` contains `HealthGameContext : DbContext`, SQL Server registration, EF configuration, and concrete adapters.
- `HealthGame.Api` contains controllers, HTTP contracts, authentication/authorization composition, middleware, and request-bound services.
- `backend/tests` contains the test project shell, but no working tests yet.

Implemented HTTP slice:

- `POST /api/goals`
- `GET /api/goals`
- `GET /api/goals/{id}`

Implemented domain surface:

- Goals with name, description, target quantity/unit, cadence, user ownership, time zone, week start, soft delete.
- Activity entries with quantity, notes, timestamps, ownership, and soft delete.
- Rewards with goal target and streak milestone conditions.
- Cadence period calculation for hourly, daily, weekly, monthly, custom hours, and custom days.
- Streak calculation for current and longest streaks.
- User profiles and roles.

Primary backend gaps:

- Goal edit/delete endpoints and handlers are missing.
- Activity endpoints and handlers are missing.
- Reward endpoints and handlers are missing.
- Streak values are not projected through goal DTOs yet.
- User profile persistence and profile endpoints are missing.
- `UserProfile` is not registered on `IHealthGameContext` or mapped in EF.
- EF migrations are not checked in.
- Tests are not implemented.
- Authorization is only partially composed through JWT bearer and policies.
- Security, observability, and performance requirements need completion and verification.

## Established Patterns To Preserve

### Domain

- Keep domain types free of Application, Infrastructure, and Api references.
- Put invariants in domain factories/methods, as shown by `Goal.Create`, `Goal.Update`, `Goal.LogActivity`, `Reward.Create`, and `GoalCadence.Create`.
- Continue using private constructors and private setters for EF-compatible entities.
- Keep one top-level type per C# file, with the file name matching the type name.
- Use domain methods instead of mutating entity properties from handlers.

### Application

- Add each use case as a MediatR request under a feature folder:
  - Commands under `Feature/Commands`
  - Queries under `Feature/Queries`
  - Handlers under `Feature/CommandHandlers` or `Feature/QueryHandlers`
- Handlers depend on:
  - `IHealthGameContext`
  - `ICurrentUserContext`
  - `IClock`
  - `ILogger<T>` where behavior should be logged
  - small application abstractions only when needed for testable domain support
- Do not let handlers depend on `HealthGameContext`, HTTP types, controllers, or Infrastructure services directly.
- Return nullable DTOs or boolean results for ownership misses where the controller should return `404 NotFound`, matching the existing no-disclosure pattern.
- Use `AsNoTracking()` for read queries that do not mutate state.

### Infrastructure

- Keep EF Core SQL Server as the primary persistence path.
- Register concrete infrastructure through `IServiceCollection` in `HealthGame.Infrastructure.DependencyInjection`.
- Add one EF configuration class per aggregate/entity.
- Add indexes for ownership and common lookup paths.
- Check in EF Core migrations for schema changes.

### Api

- Keep endpoints on `[ApiController]` classes inheriting from `ControllerBase`.
- Controllers translate HTTP contracts into MediatR requests and call `IMediator.Send`.
- Keep HTTP request records in `HealthGame.Api.Contracts`.
- Use data annotations for trust-boundary validation where practical, backed by domain guards.
- Protect data-bearing endpoints with `[Authorize(Policy = AuthorizationPolicies.User)]`.
- Protect administrative endpoints with `[Authorize(Policy = AuthorizationPolicies.Admin)]`.
- Return `ProblemDetails` for errors and avoid leaking stack traces.

## Completion Workstreams

### 1. Backend Foundation Hardening

Traces to: L2-016, L2-017, L2-022, L2-023, L2-024, L2-025, L2-026, L2-027, L2-028, L2-029

Deliverables:

- Ensure every backend C# file follows one top-level type per file.
- Extend `IHealthGameContext` with `DbSet<UserProfile>` once user persistence is implemented.
- Add EF configuration for `UserProfile` and its roles.
- Add EF migrations under `HealthGame.Infrastructure`.
- Add EF query indexes:
  - goals by `UserId`, `IsDeleted`, `Name`
  - activity entries by `UserId`, `GoalId`, `OccurredAtUtc`, `DeletedAtUtc`
  - rewards by `UserId`, `GoalId`, `IsEarned`
  - user profiles by `SubjectId` and `DeletedAtUtc`
- Update read queries and mutating handlers to consistently exclude soft-deleted records.
- Keep `CorrelationIdMiddleware` and `ExceptionHandlingMiddleware`; extend error mapping only where needed by implemented endpoints.
- Preserve `Microsoft.Extensions.Logging`, `IConfiguration`, and `IServiceCollection`.
- Add a small time zone resolution abstraction only if handlers need to resolve persisted `TimeZoneId` values into `TimeZoneInfo` for domain methods.

Acceptance checks:

- Domain has no references to Application, Infrastructure, or Api.
- Application has no references to Infrastructure or Api.
- Infrastructure references Application and Domain only.
- Api composes Application and Infrastructure only.
- `dotnet build backend/HealthGame.Backend.sln` succeeds after restore.

### 2. Goal Completion

Traces to: L2-001, L2-002, L2-003, L2-004, L2-007, L2-011, L2-012, L2-015, L2-016, L2-018, L2-025, L2-026, L2-034

Current state:

- Create/list/detail exist.
- Edit/delete are missing.
- Goal DTOs do not include streak summary.
- Existing goal queries do not yet filter `IsDeleted`.
- Existing create defaults schedule data to UTC/Monday through the domain overload.

Deliverables:

- Add `UpdateGoalRequest` and `UpdateGoalCommand`.
- Add `DeleteGoalCommand`.
- Add `PUT /api/goals/{id}`.
- Add `DELETE /api/goals/{id}`.
- Add schedule handling using existing domain properties:
  - `TimeZoneId`
  - `WeekStartsOn`
  - cadence type and interval
- Default schedule data from the current user profile when omitted.
- Keep resource ownership checks in handlers by filtering on current `UserId`.
- Return `404 NotFound` for missing or non-owned goals.
- Exclude soft-deleted goals from all read/update/delete paths.
- Update `GoalDto` with:
  - cadence
  - current streak
  - longest streak
  - schedule fields needed by the client
- Compute streaks in goal list and detail queries using the existing domain `StreakCalculator`.
- Keep list responses capped at 100 goals unless requirements change.
- Make create/update validations align across data annotations and domain guards.

Endpoint shape:

- `GET /api/goals`
- `GET /api/goals/{id}`
- `POST /api/goals`
- `PUT /api/goals/{id}`
- `DELETE /api/goals/{id}`

Acceptance checks:

- Users can create, read, update, and delete only their own active goals.
- Non-owned goals return `404 NotFound`.
- Invalid name, target, cadence, interval, schedule, or unit returns `400 BadRequest`.
- Delete removes the goal from user-visible reads.
- Current and longest streak are present in goal list and detail responses.

### 3. Activity Logging

Traces to: L2-005, L2-006, L2-007, L2-011, L2-012, L2-015, L2-016, L2-018, L2-025, L2-026, L2-034

Deliverables:

- Add `ActivityEntryDto`.
- Add `LogActivityRequest` and `LogActivityCommand`.
- Add `UpdateActivityEntryRequest` and `UpdateActivityEntryCommand`.
- Add `DeleteActivityEntryCommand`.
- Add `GetGoalActivityEntriesQuery`.
- Add activity endpoints:
  - `GET /api/goals/{goalId}/activities`
  - `POST /api/goals/{goalId}/activities`
  - `PUT /api/goals/{goalId}/activities/{activityEntryId}`
  - `DELETE /api/goals/{goalId}/activities/{activityEntryId}`
- Load the owned active goal before any activity mutation.
- Use `Goal.LogActivity`, `Goal.UpdateActivityEntry`, and `Goal.DeleteActivityEntry` instead of changing activity properties directly.
- Resolve the goal's time zone before calling `Goal.LogActivity`.
- Reject future activity timestamps beyond the current cadence window through existing domain validation.
- Return activity history ordered chronologically.
- Recompute streak projections after activity changes by returning updated streak data where useful to the caller.
- Evaluate reward earning after activity create/update/delete paths where the current streak may satisfy a reward condition.

Acceptance checks:

- Users can log, edit, and delete activity only for goals they own.
- Non-owned goals or entries return `404 NotFound`.
- Future timestamps beyond the current cadence window return `400 BadRequest`.
- Deleted entries do not count toward streaks.
- Activity history is chronological.

### 4. Streak Projection

Traces to: L2-003, L2-007, L2-008 backend support, L2-011, L2-012, L2-018, L2-034

Deliverables:

- Add `StreakSummaryDto`.
- Add streak projection to `GoalDto`.
- Ensure goal detail loads the activity entries needed for streak calculation.
- Ensure goal list calculates streaks for up to 100 goals without an N+1 query pattern.
- Use current user's time zone or the goal's persisted `TimeZoneId` consistently.
- Preserve existing domain behavior:
  - current incomplete periods are not penalized
  - missed completed periods reset current streak
  - longest streak is preserved
  - goals are calculated independently
- Add unit tests around cadence and streak edge cases.

Acceptance checks:

- Daily, weekly, monthly, hourly, custom-hour, and custom-day cadences produce correct period boundaries.
- Current streak includes consecutive met periods only.
- Longest streak remains after a later missed period.
- In-progress current period behavior matches L2-007.

### 5. Rewards

Traces to: L2-009, L2-010, L2-015, L2-016, L2-022, L2-025, L2-026, L2-034

Deliverables:

- Add `RewardDto`.
- Add `RewardConditionDto`.
- Add `CreateRewardRequest` and `CreateRewardCommand`.
- Add `GetRewardsQuery`.
- Add `GetGoalRewardsQuery` if the UI needs goal-scoped reward lists.
- Add reward endpoints:
  - `GET /api/rewards`
  - `GET /api/goals/{goalId}/rewards`
  - `POST /api/goals/{goalId}/rewards`
- Use `Goal.DefineReward` for creation.
- Validate that reward conditions are present and valid.
- Reject reward creation against non-owned goals with `404 NotFound`.
- Evaluate rewards after activity changes and goal-relevant state changes.
- Mark rewards earned through `Reward.TryMarkEarned`.
- Do not revoke earned rewards if a later streak breaks.
- Log earned reward events with structured properties and without sensitive data.

Out of scope unless a new requirement is added:

- Reward editing.
- Reward deletion.
- New reward condition types beyond goal target met and streak milestone.

Acceptance checks:

- Users can define rewards for their own goals.
- Reward creation without a condition returns `400 BadRequest`.
- Earned rewards show `IsEarned` and `EarnedAtUtc`.
- Earned rewards remain earned after streak reset.

### 6. User Profiles, Authentication, And RBAC

Traces to: L2-013, L2-014, L2-015, L2-016, L2-017, L2-022, L2-025, L2-026, L2-034

Current state:

- API validates JWT bearer tokens when `Authentication:Authority` and `Authentication:Audience` are configured.
- `HttpCurrentUserContext` reads subject/name identifier and role claims.
- `AuthorizationPolicies.User` and `AuthorizationPolicies.Admin` exist.
- `UserProfile` and `UserRole` exist in Domain but are not persisted or exposed.

Deliverables:

- Persist `UserProfile`.
- Add `UserProfileConfiguration`.
- Add user/profile DTOs and contracts.
- Add user profile endpoints:
  - `GET /api/users/me`
  - `PUT /api/users/me`
  - `DELETE /api/users/me`
- Add `GetCurrentUserProfileQuery`.
- Add `UpdateCurrentUserProfileCommand`.
- Add `DeleteCurrentUserAccountCommand`.
- Add profile bootstrap behavior after OIDC sign-in:
  - create a user profile for a new authenticated subject
  - reuse an existing active profile for a known subject
  - reject deleted profiles
- Keep the current backend as a JWT-validating resource API:
  - PKCE authorization code exchange remains the responsibility of the OIDC provider/frontend flow unless a separate auth-server scope is approved.
  - Backend validates tokens, expiration, issuer, audience, and role claims.
- Apply `[Authorize(Policy = AuthorizationPolicies.User)]` to every user data endpoint.
- Apply `[Authorize(Policy = AuthorizationPolicies.Admin)]` to any role-management endpoint.
- If role assignment endpoints are required for RBAC administration, implement only minimal Admin-protected role add/remove commands against `UserProfile`.
- Write audit logs for:
  - profile creation/bootstrap
  - profile update
  - account deletion
  - role changes
- Never log tokens, code verifiers, credentials, or unnecessary PII.

Acceptance checks:

- Unauthenticated requests return `401 Unauthorized`.
- Non-admin requests to admin endpoints return `403 Forbidden`.
- Deleted accounts cannot access data-bearing endpoints.
- Account deletion removes or hides the user's owned data from normal reads.
- Security-relevant actions produce structured logs.

### 7. Security And Validation

Traces to: L2-016, L2-017, L2-022

Deliverables:

- Keep input validation at HTTP contracts through data annotations.
- Keep invariant validation inside domain methods.
- Ensure every endpoint returns structured `ProblemDetails` for invalid input.
- Ensure every data-bearing handler filters by current user ownership.
- Use EF Core LINQ/parameterized queries only.
- Continue HTTPS redirection and HSTS outside local development.
- Keep secrets out of source:
  - connection strings may have local defaults only
  - real auth authority/audience/secrets come from configuration/environment
- Confirm JWT bearer auth does not rely on cookies. CSRF token protection is not required for bearer-token APIs unless cookie-based authentication is introduced.
- Add CORS/origin configuration only for configured frontend origins, not wildcard production access.
- Add structured logs for mutating actions.
- Review log messages to avoid secrets and unnecessary PII.

Acceptance checks:

- Invalid requests return `400`.
- Unauthorized requests return `401`.
- Forbidden admin access returns `403`.
- Non-owned resources return `404` to avoid disclosure.
- No endpoint uses string-concatenated SQL.

### 8. Persistence And Migrations

Traces to: L2-027, L2-029, L2-034

Deliverables:

- Add EF Core design-time support needed to create migrations.
- Add initial migration for the complete backend model:
  - Goals
  - ActivityEntries
  - Rewards
  - UserProfiles
  - role persistence for user profiles
- Ensure decimal precision is explicit for target and quantity fields.
- Ensure owned types are mapped:
  - `GoalCadence`
  - `RewardCondition`
- Ensure private backing collections are mapped correctly:
  - `Goal.ActivityEntries`
  - `Goal.Rewards`
  - `UserProfile.Roles`
- Add indexes listed in the foundation workstream.
- Validate migration creation and database update against SQL Server LocalDB or the configured SQL Server.

Acceptance checks:

- `dotnet ef migrations add` produces expected schema changes.
- `dotnet ef database update` succeeds against SQL Server.
- Application handlers persist and read through `IHealthGameContext`.

### 9. Observability And Performance

Traces to: L2-018, L2-022

Deliverables:

- Keep correlation ID propagation on every request and response.
- Ensure the correlation ID is present in logging scopes.
- Add structured logs for create/update/delete goal, activity mutation, reward creation, reward earned, profile changes, account deletion, and role changes.
- Avoid logging request bodies that may contain notes, email addresses, tokens, or other sensitive data.
- Avoid N+1 query patterns in goal list streak projection.
- Ensure goal list reads are capped and indexed.
- Use `AsNoTracking()` for read models.
- Capture p95 response-time checks manually or through automated integration/performance tests once endpoints are complete.

Acceptance checks:

- Goal list up to 100 goals is designed to meet p95 <= 300ms.
- Goal/activity create and update paths are designed to meet p95 <= 500ms.
- Error responses include correlation ID and do not expose stack traces.

### 10. Backend Tests

Traces to: L2-001 through L2-018, L2-022 through L2-029, L2-034

Deliverables:

- Add test files with required traceability headers:

```csharp
// Acceptance Test
// Traces to: L2-NNN
// Description: ...
```

- Add domain unit tests:
  - goal validation
  - activity validation
  - cadence period boundaries
  - custom intervals
  - current streak
  - longest streak
  - incomplete current period behavior
  - reward condition evaluation
  - user profile role behavior
- Add application handler tests:
  - create/list/detail/update/delete goals
  - log/edit/delete activities
  - calculate projected streaks
  - create/list rewards
  - mark rewards earned
  - get/update/delete current profile
  - ownership isolation
- Add API/controller integration tests where behavior depends on HTTP concerns:
  - auth required
  - admin policy enforcement
  - validation problem responses
  - correlation ID response header
  - exception-to-problem mapping
- Add persistence tests against SQL Server LocalDB or configured SQL Server for mappings and migrations.

Acceptance checks:

- Every MediatR handler has at least one unit or integration test.
- Non-trivial domain logic has boundary tests.
- `dotnet test backend/HealthGame.Backend.sln` passes.

## Recommended Implementation Order

1. Foundation and persistence setup.
2. User profile persistence and current-user profile endpoints.
3. Goal edit/delete completion.
4. Activity logging/edit/delete.
5. Streak DTO projection and list/detail query optimization.
6. Reward creation/listing/earning.
7. RBAC hardening and any minimal Admin role-management endpoint required by backend requirements.
8. Security and observability pass.
9. EF migrations.
10. Backend tests and final verification.

## Requirement Trace Matrix

| Requirement | Backend plan coverage |
| --- | --- |
| L2-001 Create Goal | Goal completion, validation, tests |
| L2-002 View Goals | Goal completion, ownership filters, streak DTOs |
| L2-003 Edit Goal | Goal update command and endpoint |
| L2-004 Delete Goal | Goal soft delete command and endpoint |
| L2-005 Log Activity | Activity commands and endpoints |
| L2-006 Edit/Delete Activity | Activity update/delete commands and endpoints |
| L2-007 Compute Streak | Streak projection and domain tests |
| L2-008 Display Streaks | Backend DTO support only |
| L2-009 Define Reward | Reward creation command and endpoint |
| L2-010 Earn Rewards | Reward evaluation after activity changes |
| L2-011 Standard Cadence | Cadence tests and schedule handling |
| L2-012 Custom Cadence | Custom interval validation and tests |
| L2-013 OIDC/PKCE | Backend JWT validation and profile bootstrap within current resource API architecture |
| L2-014 Profile/Account Deletion | Current-user profile endpoints and deletion command |
| L2-015 RBAC | Policies, ownership filters, Admin endpoints where required |
| L2-016 Input Validation | API contracts, domain guards, ProblemDetails |
| L2-017 Secrets/Transport | HTTPS, configuration, no secret logging |
| L2-018 API Performance | indexes, capped reads, no N+1 streak projection |
| L2-022 Structured Logging | correlation scope, mutating/security action logs |
| L2-023 Clean Architecture | dependency direction checks |
| L2-024 SOLID | small handlers, abstractions, domain invariants |
| L2-025 MediatR CQS | all use cases as commands/queries |
| L2-026 Controllers | controller-only HTTP surface |
| L2-027 EF DbContext | SQL Server EF Core, migrations |
| L2-028 Microsoft Extensions | built-in logging/config/DI |
| L2-029 Solution Structure | existing old-style solution under `backend/src` and `backend/tests` |
| L2-034 Backend Tests | unit, integration, and traceability headers |

## Definition Of Done

The backend completion work is done when:

- All planned backend endpoints exist and follow Controller -> MediatR -> handler -> `IHealthGameContext` -> EF Core.
- Every data-bearing path enforces authenticated user ownership.
- Admin-only paths, if present, use `AuthorizationPolicies.Admin`.
- Goal, activity, streak, reward, profile, auth, RBAC, validation, logging, and persistence behavior is covered by tests.
- EF migrations are checked in and apply cleanly to SQL Server.
- `dotnet restore backend/HealthGame.Backend.sln` succeeds.
- `dotnet build backend/HealthGame.Backend.sln --no-restore` succeeds.
- `dotnet test backend/HealthGame.Backend.sln --no-build` succeeds.
- Logs include correlation IDs and do not include secrets.
- The implementation stays within the documented backend requirements and established backend patterns.
