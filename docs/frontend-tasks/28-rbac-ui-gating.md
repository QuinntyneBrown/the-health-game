---
status: Accepted
---

# Task 28 — RBAC UI gating with `hgIfRole` and `roleGuard`

**Traces to:** L2-015
**Design references:** N/A.
**User value:** Admin-only controls and routes are hidden from non-admin users; backend remains the source of truth.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/rbac-ui-gating.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-015
  // Description: Non-admin users do not see admin controls and cannot reach admin routes.
  ```
  Scenarios:
  1. Non-admin: admin controls are not in the DOM.
  2. Admin: admin controls render.
  3. Non-admin direct navigation to an admin route is bounced (returns to `/`).
- Run; confirm RED.

## Implementation outline

- Add `hgIfRole` structural directive in `domain/` (depends on `IAuthService`).
- Add `roleGuard(role)` in `api/` `auth/`.
- Apply directive to any admin-only control; apply guard to any admin route.

## Definition of Done

- Playwright spec green.
- **UI design inspection:** verify no layout shift or empty placeholder when the directive hides a control.
