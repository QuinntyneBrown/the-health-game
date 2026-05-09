---
status: Complete
---

# Task 06 — OIDC sign-in redirect flow

**Traces to:** L2-013, L2-017
**Design references:** `Screens / Onboarding` (`Xxdwc`).
**User value:** A signed-out user clicking "Sign in" is redirected to the OIDC provider with a PKCE code challenge.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/pages/SignInPage.ts` with `clickSignIn()`, `expectRedirectToAuthority()`.
- Add `frontend/e2e/specs/sign-in.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-013
  // Description: Clicking "Sign in" redirects to the configured OIDC authority with PKCE.
  ```
  Scenarios:
  1. Visiting `/` while unauthenticated shows the onboarding screen with a "Sign in" CTA.
  2. Clicking "Sign in" navigates the browser to a URL on `oidcAuthority` containing `response_type=code`, `code_challenge`, `code_challenge_method=S256`, and the configured `client_id` and `redirect_uri`.
- Run; confirm RED.

## Implementation outline

- Add `auth/auth.service.contract.ts` (`IAuthService`, `AUTH_SERVICE`) and `auth.service.ts` in `projects/api/src/lib/` using `angular-auth-oidc-client` (or `oidc-client-ts`).
- `signIn(returnUrl?)` triggers the redirect with PKCE.
- Configure the OIDC client from `API_CONFIG`.
- Add an onboarding component in `domain/` (or a small landing route in `the-health-game`) that shows "Sign in" when not authenticated.
- Do not log tokens or code verifier.

## Definition of Done

- Playwright spec green.
- Unit tests for `AuthService.signIn` pass.
- **UI design inspection:** at 360/768/1440, compare onboarding against `Xxdwc` (`RI9ju`, `XX4FN`, `oF4rK`) for layout, hero copy, button style (Filled), and brand mark.
