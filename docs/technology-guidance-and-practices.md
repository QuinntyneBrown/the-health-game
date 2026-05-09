# Technology Guidance & Practices

## General
- Mobile first web app that also looks great and works well on large screens
- The entire solution shall follow S.O.L.I.D. principles

## Backend (.NET)
- Clean architecture
- Command/Query Separation (CQS) pattern implemented using MediatR (free version)
- ASP.NET Core Controllers for HTTP endpoints
- Entity Framework `DbContext` for data access
- Command and query handlers depend on an `IAppDbContext` interface; the concrete `AppDbContext` inherits `DbContext` and implements `IAppDbContext` (replace `App` with the solution-specific name)
- Do not add repository or unit-of-work abstractions
- Microsoft SQL Server database
- Microsoft Extensions for Logging, Configuration, and Dependency Injection
- Old style solution file format (.sln)
    - `backend/src` — Api project, etc.
    - `backend/tests` — backend tests
- C# files MUST be split one type per file. Every class, interface, enum, record, struct, and delegate gets its own file. NO files containing a class AND an interface, multiple enums, multiple classes, or any other combination of top-level types. The file name MUST match the type name (e.g., `FooService.cs` contains `FooService` and nothing else)

### Validation
- Use **FluentValidation**. Do not use `System.ComponentModel.DataAnnotations` attributes on commands, queries, or request DTOs.
- One `AbstractValidator<TCommand>` per command, colocated with the command in the Application layer (`<CommandName>Validator.cs`). Same pattern for nested DTOs.
- A MediatR pipeline behavior runs validators before the handler; failures throw `ValidationException` and the API maps them to HTTP 400 `ValidationProblemDetails`.
- Register validators by assembly scanning so new ones are picked up automatically.
- HTTP request DTOs are pure transport shapes — no validation attributes; map to commands and let the Application layer validate.

## Authentication & User Management
- PKCE authorization
- Full user management
- RBAC implementation from database to frontend

## Frontend (Angular)
- Angular Material components for every component — buttons, headers, inputs, etc. (see https://m3.material.io/)
- Design Tokens for consistent colors and spacing across the app
- BEM naming convention for all HTML/CSS classes
- All components MUST be split into FILE PER TYPE (html, scss, ts). NO single file components
- Angular workspace split into libraries and apps
- Libraries use interface-driven service consumption (see https://github.com/QuinntyneBrown/interface-driven-service-consumption)

### Library Structure
- **api library** — models and services needed to communicate with the backend
    - exposes an interface for each service
        - `foo.service.ts`
        - `foo.service.contract.ts` — includes TypeScript interface and injection token
- **components library** — reusable UI components (buttons, headers, etc.). Does not depend on api library
- **domain library** — UI components that depend on api library
    - exposes an interface for each service (if any)
        - `foo.service.ts`
        - `foo.service.contract.ts` — includes TypeScript interface and injection token
- **main application** — depends on api, components, and domain libraries

## Testing
- E2E testing using Playwright page object model for important functionality
