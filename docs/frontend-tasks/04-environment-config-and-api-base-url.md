# Task 04 — Environment configuration and API base URL

**Traces to:** L2-013, L2-017, L2-019
**Design references:** none (infrastructure task).
**User value:** The app reads its API and OIDC URLs from per-environment files so dev/prod can differ without code changes.

## ATDD — Failing Playwright test (POM) first

- Add `frontend/e2e/specs/environment-config.spec.ts`:
  ```ts
  // Acceptance Test
  // Traces to: L2-013, L2-017
  // Description: The app reads apiBaseUrl and OIDC config from the environment file.
  ```
  Scenarios:
  1. With the development environment active, the loaded `/` page exposes a global readable indicator that resolves the configured `apiBaseUrl` (e.g., a `data-api-base-url` attribute on `<body>` set from the injected `API_CONFIG`, or a known network call observed via `page.route`).
  2. The configured URL matches the development environment file value.
- Run; confirm RED.

## Implementation outline

- Add `projects/the-health-game/src/environments/environment.ts` (production) and `environment.development.ts` (dev), each exporting `AppEnvironment { apiBaseUrl, oidcAuthority, oidcClientId, oidcScopes, oidcRedirectUri, oidcPostLogoutRedirectUri }`.
- Add `fileReplacements` in `angular.json` for the development build.
- Add `API_CONFIG` injection token and `ApiConfig` interface inside `projects/api/src/lib/`.
- Update `provideApiServices(config: ApiConfig)` to accept and register `API_CONFIG`.
- `app.config.ts` imports `environment` and passes it to `provideApiServices(environment)`.
- Set the `data-api-base-url` attribute (or equivalent observable hook) on `<body>` in `App` solely for the test hook — gate behind `!environment.production`.

## Definition of Done

- Playwright spec green.
- `npm run start` uses dev URLs; `npm run build` uses prod URLs.
- Production URLs are HTTPS only.
- No secrets in source control.
- **UI design inspection:** none required; this is infrastructure. Confirm no visual regression at 360/768/1440.
