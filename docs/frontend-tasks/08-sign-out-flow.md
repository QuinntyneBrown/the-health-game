# Task 08 — Sign-out flow

**Traces to:** L2-013, L2-014
**Design references:** profile screen sign-out control in `LH8l2`.
**User value:** The user can sign out, clearing local session and ending the OIDC session.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/ProfilePage.ts` with `clickSignOut()`.
- Add `frontend/e2e/specs/sign-out.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-013, L2-014
  // Description: Sign-out clears the session and redirects to the OIDC end-session endpoint.
  ```
  Scenarios:
  1. From the profile page, clicking "Sign out" navigates the browser to `oidcAuthority`'s end-session endpoint with the configured `post_logout_redirect_uri`.
  2. After completion of `/auth/signed-out`, visiting any guarded route triggers re-authentication.
- Run; confirm RED.

## Implementation outline

- Add `/auth/signed-out` route.
- `AuthService.signOut()` clears local state and triggers OIDC end-session.
- Add the sign-out control on the profile component placeholder (full profile UI lands in task 10).

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 360/768/1440, sign-out CTA matches the profile design's control style and spacing.
