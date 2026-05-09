# Task 10 — View current user profile

**Traces to:** L2-014, L2-021
**Design references:** `Screens / Stats & Profile` (`LH8l2`) — `ghzdf` (mobile), `fMcNY` (tablet), `PYIzx` (desktop).
**User value:** An authenticated user opens `/profile` and sees their avatar, display name, email, and roles.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/ProfilePage.ts` with `displayName()`, `email()`, `roleBadges()`.
- Add `frontend/e2e/specs/profile-view.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-014
  // Description: The profile route renders the authenticated user's profile from /api/users/me.
  ```
  Scenarios (with mocked `/api/users/me`):
  1. Visiting `/profile` shows display name, email, and avatar from the response.
  2. Role badges render only for present roles.
- Run; confirm RED.

## Implementation outline

- Add `domain/profile/` feature (`profile.component.*`, `profile.service.*` + contract, `profile.providers.ts`, `profile.routes.ts`, exported via `public-api.ts`).
- `IUsersService.getCurrentUser()` in `api/`.
- `<hg-user-avatar>`, `<hg-page-header>`, `<hg-section-header>` for layout.
- Lazy-load `PROFILE_ROUTES` in `app.routes.ts`.

## Definition of Done

- Playwright spec green.
- Unit tests for `UsersService` and feature service.
- **UI design inspection:** at 360/768/1440 compare against `ghzdf` / `fMcNY` / `PYIzx` for header, avatar size, type hierarchy, and section spacing.
