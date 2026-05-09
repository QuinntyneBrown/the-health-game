# Task 07 — OIDC callback handling and token attachment

**Traces to:** L2-013, L2-017
**Design references:** none (post-redirect navigation).
**User value:** After signing in at the OIDC provider, the user lands back in the app authenticated, and API calls carry their bearer token.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/oidc-callback.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-013
  // Description: After OIDC callback, the user is authenticated and API calls include the bearer token.
  ```
  Scenarios using a mocked OIDC token endpoint and mocked `/api/users/me`:
  1. Visiting `/auth/callback?code=...&state=...` exchanges the code, lands on the post-login route, and renders authenticated UI.
  2. Subsequent network calls to `apiBaseUrl` carry `Authorization: Bearer <token>`.
- Run; confirm RED.

## Implementation outline

- Add `/auth/callback` route invoking `AuthService.handleRedirect()`.
- Implement `getAccessToken()` returning the current token (with silent renew).
- Implement `auth.interceptor.ts` to attach the token to requests targeting `apiBaseUrl` only.
- After successful login, navigate to the stored `returnUrl` or `/`.
- Bootstrap profile by calling `IUsersService.getCurrentUser()` once authenticated (cache in `currentUser` signal on `AuthService`).

## Definition of Done

- Playwright spec green.
- Unit tests for `AuthService.handleRedirect`, `getAccessToken`, and `authInterceptor` pass.
- **UI design inspection:** none required; verify no flicker/layout-shift at 360/768/1440 during the callback handoff.
