# Task 32 — Module-boundary lint and convention enforcement

**Traces to:** L2-024, L2-031, L2-032, L2-033
**Design references:** N/A.
**User value:** Architectural mistakes (forbidden cross-library imports, single-file components, hex colors in component SCSS, `@Input` decorators) fail CI instead of being caught by reviewers.

## ATDD — Failing Playwright test (POM) first

This task is enforced in CI rather than in the browser, so the "failing acceptance test" is a failing lint configuration applied to a deliberate violation:

- Add `frontend/e2e/specs/module-boundary-sentinel.spec.ts` that runs `npm run lint` via `child_process` and asserts a non-zero exit on a temporary fixture file containing a forbidden import. Remove the fixture when the test is green-after-removal.
  ```ts
  // Acceptance Test
  // Traces to: L2-033
  // Description: lint fails when a fixture violates module boundaries.
  ```

## Implementation outline

- Add ESLint with `@angular-eslint`, `eslint-plugin-import`, and a `no-restricted-imports` configuration enforcing:
  - `api` cannot import `components`, `domain`, `the-health-game`.
  - `components` cannot import `api`, `domain`, `the-health-game`.
  - `domain` cannot import `the-health-game`.
- Rule banning `@Input` / `@Output` decorators in new code (allow inside library code only if the existing component already uses them and replacement is out of scope).
- Stylelint (or a regex-based pre-commit script) flagging hex colors and px values in `projects/components/src/**/*.scss` and `projects/domain/src/**/*.scss`.
- `npm run lint` script wired in `frontend/package.json` and CI.

## Definition of Done

- Lint fails on the deliberate violation.
- Lint passes on the cleaned tree.
- **UI design inspection:** none required; verify no visual regression at 360/768/1440 after any code reformatting from auto-fix.
