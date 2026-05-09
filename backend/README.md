# Backend MVP

This backend is intentionally thin. Its purpose is to establish the architectural patterns required by `docs/specs/L1.md`, `docs/specs/L2.md`, and `docs/technology-guidance-and-practices.md`.

## Shape

- `src/HealthGame.Domain` contains domain entities and value objects only.
- `src/HealthGame.Application` contains MediatR commands/queries, handlers, and the application-owned `IHealthGameContext` abstraction.
- `src/HealthGame.Infrastructure` contains `HealthGameContext : DbContext` plus SQL Server EF Core configuration and concrete adapters.
- `src/HealthGame.Api` contains ASP.NET Core controllers, authentication composition, authorization policies, middleware, and HTTP contracts.
- `tests/` contains backend test projects; real test coverage can be added after behavior stabilizes.

## Implemented Slice

The only implemented use case is a goals slice:

- `POST /api/goals` creates a goal for the authenticated user.
- `GET /api/goals` lists goals for the authenticated user.
- `GET /api/goals/{id}` reads a single owned goal.

The slice demonstrates Controller -> MediatR -> handler -> `IHealthGameContext` -> EF Core `DbContext`, with request validation, user scoping, SQL Server persistence, correlation IDs, and structured logging.

MediatR is pinned to package version `12.5.0`; commands and queries implement `IRequest<TResponse>`, and handlers implement `IRequestHandler<TRequest, TResponse>`.
