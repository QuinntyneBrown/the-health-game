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
- Use **FluentValidation** for all request validation. **Do NOT use `System.ComponentModel.DataAnnotations` attributes** (`[Required]`, `[StringLength]`, `[Range]`, `[EmailAddress]`, etc.) on commands, queries, or HTTP request DTOs.
- Each MediatR command (and query, when validation is needed) gets its own validator class declared in the **Application** project, colocated with the command and named `<CommandName>Validator`. Example: `CreateGoalCommand` → `CreateGoalCommandValidator.cs` in the same folder.
- Validators inherit from `AbstractValidator<TCommand>`. Define rules in the constructor with `RuleFor(x => x.Property)...`. For nested DTOs, declare a separate `<DtoName>Validator` and wire it via `.SetValidator(new <DtoName>Validator())`.
- Validators run automatically as a **MediatR pipeline behavior** (`ValidationBehavior<TRequest, TResponse>`) before the handler executes. On failure the behavior throws `FluentValidation.ValidationException`, which the API exception middleware maps to HTTP 400 with a `ValidationProblemDetails` payload (field → error messages).
- Register validators by assembly scanning in `AddApplication`: `services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly, includeInternalTypes: true)`. New validators are picked up automatically.
- Reference example pattern: https://github.com/QuinntyneBrown/Commitments/blob/9eb0a58f670bb8fd385ba41153a52987e6c29283/backend/src/Modules/Commitments/Features/Tag/Commands/SaveTag.cs#L10
- HTTP request DTOs in `HealthGame.Api/Contracts` carry **no validation attributes**. They are pure transport shapes; their `ToCommand()` mappers hand off to the Application layer where validation lives.

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
