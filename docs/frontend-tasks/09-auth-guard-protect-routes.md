---
status: Complete
---

# Task 09 — `authGuard` on protected routes

**Traces to:** L2-013, L2-015
**Design references:** none.
**User value:** Unauthenticated users hitting any protected URL get redirected to sign in, then back to where they were going.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/auth-guard.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-013, L2-015
  // Description: Unauthenticated access to a guarded route triggers OIDC sign-in with returnUrl.
  ```
  Scenarios:
  1. While unauthenticated, visiting `/goals` redirects to the OIDC authority with `state` carrying `/goals`.
  2. After completing the mocked callback, the browser ends on `/goals`.
- Run; confirm RED.

## Implementation outline

- Add `authGuard` (`CanMatchFn`) using `inject(AUTH_SERVICE).isAuthenticated()`; otherwise call `signIn(currentUrl)` and return `false`.
- Apply to `goals`, `rewards`, `profile`, dashboard routes (every non-auth route).

## Definition of Done

- Playwright spec green.
- **UI design inspection:** none required; verify no layout flash on the guarded redirect.
