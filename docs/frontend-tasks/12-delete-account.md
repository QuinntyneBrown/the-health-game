---
status: Accepted
---

# Task 12 — Delete account

**Traces to:** L2-014, L2-021
**Design references:** Dialog component `xebkN`; profile actions in `LH8l2`.
**User value:** A user can permanently delete their account after explicit confirmation; they are signed out and redirected.

## ATDD — Failing Playwright test (POM) first

- Extend `ProfilePage.ts` with `clickDeleteAccount()`, `confirmDeletion(typedConfirmation)`.
- Add `frontend/e2e/specs/account-delete.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-014
  // Description: Account deletion requires explicit typed confirmation, calls DELETE /api/users/me, and signs the user out.
  ```
  Scenarios (mocked):
  1. Clicking "Delete account" opens a confirmation dialog requiring the user to type their email.
  2. Confirm button is disabled until the typed text matches.
  3. On confirm, `DELETE /api/users/me` is called and the browser is redirected to the OIDC end-session.
- Run; confirm RED.

## Implementation outline

- `MatDialog` with a confirmation form; require typed match.
- `IUsersService.deleteCurrentUser()`.
- On success, `AuthService.signOut()`.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** confirm dialog matches `xebkN` (corner radius, padding 32, shadow, type, button arrangement) at 360/768/1440.
