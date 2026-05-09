# Task 11 — Edit display name and email

**Traces to:** L2-014, L2-016, L2-021
**Design references:** profile edit fields in `LH8l2`, `<hg-health-text-field>` styles.
**User value:** The user can update display name and email, and the change persists.

## ATDD — Failing Playwright test (POM) first

- Extend `ProfilePage.ts` with `editProfile()`, `setDisplayName()`, `setEmail()`, `save()`.
- Add `frontend/e2e/specs/profile-edit.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-014, L2-016
  // Description: User edits display name and email; the values persist on reload.
  ```
  Scenarios (mocked PUT `/api/users/me`):
  1. Submitting valid edits updates the visible profile values.
  2. Empty display name surfaces an inline validation error and disables Save.
- Run; confirm RED.

## Implementation outline

- Reactive form with `<hg-health-text-field>` for name and email.
- `IUsersService.updateCurrentUser(input)`.
- Map `ValidationError` from the interceptor to field-level messages.
- Refresh `currentUser` signal after success.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** at 360/768/1440 confirm field spacing, label position, helper-text style, button states, and focus ring match the design.
