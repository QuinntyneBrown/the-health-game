# Contributing

Thank you for taking the time to contribute to The Health Game. This guide keeps
changes consistent with the repository's architecture, coding standards, and
testing expectations.

## Ways to Contribute

- Report reproducible bugs.
- Propose scoped feature improvements.
- Improve documentation.
- Add tests for existing behavior.
- Implement accepted issues or roadmap items.

For security issues, do not open a public issue. Follow [SECURITY.md](SECURITY.md).

## Development Setup

Install the project prerequisites:

- .NET SDK 10.0.101 or newer 10.0 feature band
- Node.js with npm 10.9.4 or compatible
- Microsoft SQL Server or SQL Server LocalDB

Build the backend:

```bash
cd backend
dotnet restore
dotnet build HealthGame.Backend.sln
```

Build the frontend:

```bash
cd frontend
npm install
npm run build
```

## Branching

Use short, descriptive branch names:

```text
feature/create-activity-entry
fix/goal-ownership-check
docs/update-local-setup
```

Keep each pull request focused on one logical change.

## Coding Standards

Backend:

- Preserve Clean Architecture boundaries.
- Put domain behavior in `HealthGame.Domain`.
- Put use cases in `HealthGame.Application` as MediatR commands or queries.
- Keep infrastructure details in `HealthGame.Infrastructure`.
- Keep HTTP contracts, controllers, middleware, and auth composition in
  `HealthGame.Api`.
- Use one top-level C# type per file.
- Use nullable reference types intentionally.
- Do not introduce repository or unit-of-work wrappers over EF Core.

Frontend:

- Use Angular Material or project wrappers for UI primitives.
- Keep component templates, styles, and TypeScript in separate files.
- Use BEM class names in HTML and SCSS.
- Use design tokens for colors and spacing.
- Keep `projects/components` free of `api` and `domain` dependencies.
- Expose consumed services through interface-driven contracts and
  `InjectionToken`s.

## Tests

Run backend tests before opening a pull request:

```bash
cd backend
dotnet test HealthGame.Backend.sln
```

Run frontend tests before opening a pull request:

```bash
cd frontend
npm test
```

For acceptance tests, include traceability headers:

```text
// Acceptance Test
// Traces to: L2-001
// Description: Creates a valid authenticated user goal.
```

Add or update tests when a change affects:

- Domain rules.
- Application handlers.
- API authorization or validation.
- Frontend user flows.
- Component behavior.
- Cross-layer contracts.

## Pull Request Checklist

Before opening a pull request, confirm:

- The change is scoped to one purpose.
- Public behavior is documented when needed.
- Backend and frontend boundaries are preserved.
- Tests were added or updated for changed behavior.
- `dotnet test HealthGame.Backend.sln` passes when backend code changed.
- `npm test` passes when frontend code changed.
- Secrets, credentials, generated logs, and local database files are not included.

## Review Expectations

Maintainers review for correctness, maintainability, security, accessibility,
test coverage, and consistency with the documented architecture. Review comments
should be specific, actionable, and tied to project requirements where possible.
