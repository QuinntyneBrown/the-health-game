import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { expect } from '@playwright/test';

export class SourceCodeInspector {
  readonly repoRoot = findRepoRoot();

  file(relativePath: string): string {
    return path.join(this.repoRoot, relativePath);
  }

  read(relativePath: string): string {
    return readFileSync(this.file(relativePath), 'utf8');
  }

  exists(relativePath: string): boolean {
    return existsSync(this.file(relativePath));
  }

  filesUnder(relativePath: string, extensions?: readonly string[]): readonly string[] {
    const root = this.file(relativePath);
    if (!existsSync(root)) {
      return [];
    }

    const files: string[] = [];
    const visit = (current: string): void => {
      for (const entry of readdirSync(current)) {
        if (['.git', 'node_modules', 'bin', 'obj', 'dist', 'artifacts', '.angular'].includes(entry)) {
          continue;
        }

        const fullPath = path.join(current, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          visit(fullPath);
        } else if (!extensions || extensions.includes(path.extname(entry))) {
          files.push(path.relative(this.repoRoot, fullPath).replace(/\\/g, '/'));
        }
      }
    };

    visit(root);
    return files;
  }

  expectOldStyleSolution(): void {
    const solution = this.read('backend/HealthGame.Backend.sln');
    expect(solution).toMatch(/^Microsoft Visual Studio Solution File, Format Version/m);
    expect(solution).not.toContain('<Project Sdk=');
  }

  expectBackendProjectLayout(): void {
    expect(this.exists('backend/src/HealthGame.Api/HealthGame.Api.csproj')).toBeTruthy();
    expect(this.exists('backend/src/HealthGame.Application/HealthGame.Application.csproj')).toBeTruthy();
    expect(this.exists('backend/src/HealthGame.Domain/HealthGame.Domain.csproj')).toBeTruthy();
    expect(this.exists('backend/src/HealthGame.Infrastructure/HealthGame.Infrastructure.csproj')).toBeTruthy();
    expect(this.exists('backend/tests/HealthGame.Application.Tests/HealthGame.Application.Tests.csproj')).toBeTruthy();
  }

  expectCleanArchitectureReferences(): void {
    const domainProject = this.read('backend/src/HealthGame.Domain/HealthGame.Domain.csproj');
    const applicationProject = this.read('backend/src/HealthGame.Application/HealthGame.Application.csproj');
    const infrastructureProject = this.read('backend/src/HealthGame.Infrastructure/HealthGame.Infrastructure.csproj');
    const apiProject = this.read('backend/src/HealthGame.Api/HealthGame.Api.csproj');

    expect(domainProject).not.toMatch(/HealthGame\.(Application|Infrastructure|Api)/);
    expect(applicationProject).not.toMatch(/HealthGame\.(Infrastructure|Api)/);
    expect(infrastructureProject).not.toMatch(/HealthGame\.Api/);
    expect(apiProject).toMatch(/HealthGame\.Application/);
    expect(apiProject).toMatch(/HealthGame\.Infrastructure/);
  }

  expectControllersUseMediatR(): void {
    for (const file of this.filesUnder('backend/src/HealthGame.Api/Controllers', ['.cs'])) {
      const source = this.read(file);
      expect(source, file).toContain('[ApiController]');
      expect(source, file).toMatch(/:\s*Controller(Base)?/);
      expect(source, file).toMatch(/IMediator\s+\w+/);
      expect(source, file).toMatch(/mediator\.Send\(/);
      expect(source, file).not.toMatch(/new\s+(Goal|Reward|ActivityEntry|UserProfile)\(/);
    }
  }

  expectCommandsAndQueriesHaveHandlers(): void {
    const commandsAndQueries = this.filesUnder('backend/src/HealthGame.Application', ['.cs']).filter((file) =>
      /\/(Commands|Queries)\//.test(file),
    );
    const handlers = this.filesUnder('backend/src/HealthGame.Application', ['.cs']).filter((file) =>
      /\/(CommandHandlers|QueryHandlers)\//.test(file),
    );
    const handlerSources = handlers.map((file) => this.read(file)).join('\n');

    for (const file of commandsAndQueries) {
      const source = this.read(file);
      const match = source.match(/(?:record|class)\s+(\w+)/);
      if (!match || /Validator$/.test(match[1])) {
        continue;
      }

      expect(source, file).toMatch(/IRequest/);
      expect(handlerSources, file).toContain(`IRequestHandler<${match[1]}`);
    }
  }

  expectEfCoreSqlServerPersistence(): void {
    const infrastructure = this.filesUnder('backend/src/HealthGame.Infrastructure', ['.cs']).map((file) => this.read(file)).join('\n');
    const backendSources = this.filesUnder('backend/src', ['.cs']).map((file) => this.read(file)).join('\n');

    expect(infrastructure).toMatch(/DbContext/);
    expect(infrastructure).toMatch(/UseSqlServer/);
    expect(this.filesUnder('backend/src/HealthGame.Infrastructure/Data/Migrations', ['.cs']).length).toBeGreaterThan(0);
    expect(backendSources).not.toMatch(/System\.Data\.SqlClient|Microsoft\.Data\.SqlClient|Dapper|SqlCommand|FromSqlRaw\(\s*\$|ExecuteSqlRaw\(\s*\$/);
  }

  expectMicrosoftExtensionsUsage(): void {
    const backendSources = this.filesUnder('backend/src', ['.cs']).map((file) => this.read(file)).join('\n');
    expect(backendSources).toMatch(/Microsoft\.Extensions\.Logging|ILogger</);
    expect(backendSources).toMatch(/Microsoft\.Extensions\.Configuration|IConfiguration|IOptions</);
    expect(backendSources).toMatch(/Microsoft\.Extensions\.DependencyInjection|IServiceCollection/);
  }

  expectSolidHeuristics(): void {
    const classFiles = [
      ...this.filesUnder('backend/src', ['.cs']),
      ...this.filesUnder('frontend/projects', ['.ts']).filter((file) => !file.endsWith('.spec.ts')),
    ];
    const multiResponsibilityFiles = classFiles.filter((file) => {
      const source = this.read(file);
      const typeCount = [...source.matchAll(/\b(class|record)\s+\w+/g)].length;
      const componentFile = file.endsWith('.component.ts');
      return typeCount > (componentFile ? 2 : 1) && !/Dto|Request|Response|Routes|Program\.cs$/.test(file);
    });
    const directConcreteDependencies = this.filesUnder('backend/src', ['.cs']).filter((file) =>
      /new\s+HealthGame\w+|new\s+\w+Repository|new\s+\w+Service/.test(this.read(file)),
    );
    const serviceConsumers = this.filesUnder('frontend/projects', ['.ts'])
      .filter((file) => !file.includes('/api/src/lib/') && !file.endsWith('.spec.ts'))
      .filter((file) => /inject\(\s*\w+Service\s*\)|constructor\([^)]*\w+Service/.test(this.read(file)));

    expect(multiResponsibilityFiles).toEqual([]);
    expect(directConcreteDependencies).toEqual([]);
    expect(serviceConsumers).toEqual([]);
  }

  expectNoHardCodedSecrets(): void {
    const sources = this.filesUnder('.', ['.cs', '.ts', '.json']).filter((file) => !file.includes('package-lock.json'));
    const offenders = sources.filter((file) =>
      /(password|clientSecret|signingKey|refreshToken|resetToken)\s*[:=]\s*['"][^'"]{8,}/i.test(this.read(file)),
    );

    expect(offenders).toEqual([]);
  }

  expectNoSecretLogging(): void {
    const sources = this.filesUnder('backend/src', ['.cs']);
    const offenders = sources.filter((file) =>
      /Log(?:Trace|Debug|Information|Warning|Error|Critical)?\([^;]*(password|accessToken|refreshToken|resetToken|token|secret)/i.test(
        this.read(file),
      ),
    );

    expect(offenders).toEqual([]);
  }

  expectStructuredExceptionLogging(): void {
    const exceptionMiddleware = this.read('backend/src/HealthGame.Api/Middleware/ExceptionHandlingMiddleware.cs');
    const correlationMiddleware = this.read('backend/src/HealthGame.Api/Middleware/CorrelationIdMiddleware.cs');

    expect(correlationMiddleware).toMatch(/BeginScope\(/);
    expect(correlationMiddleware).toMatch(/CorrelationId/);
    expect(exceptionMiddleware).toMatch(/LogError\(\s*exception/);
    expect(exceptionMiddleware).toMatch(/{Method}.*{Path}.*{UserId}/s);
    expect(exceptionMiddleware).toMatch(/ProblemDetails/);
    expect(exceptionMiddleware).toMatch(/unexpected error/i);
  }

  expectPasswordHashingAndJwtConfiguration(): void {
    const backendSources = this.filesUnder('backend/src', ['.cs']).map((file) => this.read(file)).join('\n');
    expect(backendSources).toMatch(/PasswordHash|PBKDF2|Rfc2898DeriveBytes|Argon2|BCrypt/i);
    expect(backendSources).not.toMatch(/Password\s*=\s*request\.Password|PlaintextPassword|passwordHash\s*=\s*password/i);
    expect(backendSources).toMatch(/JwtBearer|SigningCredentials|IssuerSigningKey|ValidateIssuer|ValidateAudience|ValidateLifetime/);
    expect(backendSources).toMatch(/builder\.Configuration|IConfiguration|IOptions</);
  }

  expectFrontendWorkspaceAndLibraries(): void {
    const workspace = this.read('frontend/angular.json');
    expect(workspace).toContain('"the-health-game"');
    expect(workspace).toContain('"api"');
    expect(workspace).toContain('"components"');
    expect(workspace).toContain('"domain"');
    expect(this.exists('frontend/projects/the-health-game/src/app/app.routes.ts')).toBeTruthy();
  }

  expectFrontendMaterialAndTokenUsage(): void {
    const componentSources = this.filesUnder('frontend/projects', ['.ts', '.html', '.scss']);
    const rawPrimitiveFiles = componentSources.filter((file) => {
      const source = this.read(file);
      return /<button|<input|<select|<textarea|<header/.test(source) && !/mat-|Mat[A-Z]|hg-/.test(source);
    });
    const hardCodedTokenFiles = componentSources
      .filter((file) => file.endsWith('.scss'))
      .filter((file) => /#[0-9a-fA-F]{3,8}|\b\d+px\b/.test(this.read(file)) && !file.includes('_tokens.scss'));

    expect(rawPrimitiveFiles).toEqual([]);
    expect(hardCodedTokenFiles).toEqual([]);
  }

  expectFrontendComponentFileAndBemConventions(): void {
    const componentTsFiles = this.filesUnder('frontend/projects', ['.ts']).filter((file) => file.endsWith('.component.ts'));
    for (const file of componentTsFiles) {
      const base = file.replace(/\.ts$/, '');
      expect(this.exists(`${base}.html`), file).toBeTruthy();
      expect(this.exists(`${base}.scss`), file).toBeTruthy();
      expect(this.read(file), file).not.toMatch(/template\s*:|styles\s*:/);
    }

    const classNames = this.filesUnder('frontend/projects', ['.html', '.scss'])
      .flatMap((file) => [...this.read(file).matchAll(/class(?:=|\s*{\s*)["'`]([^"'`{}]+)["'`]/g)].map((match) => ({ file, names: match[1].split(/\s+/) })))
      .flatMap((entry) => entry.names.map((name) => ({ file: entry.file, name })))
      .filter((entry) => entry.name && !/^(mat-|cdk-|ng-|active$|selected$)/.test(entry.name));

    const invalid = classNames.filter(({ name }) => !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:(?:__|--)[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(name));
    expect(invalid).toEqual([]);
  }

  expectInterfaceDrivenServices(): void {
    const services = this.filesUnder('frontend/projects/api/src/lib', ['.ts']).filter(
      (file) => file.endsWith('.service.ts') && !file.endsWith('.service.spec.ts'),
    );

    for (const service of services) {
      const contract = service.replace(/\.service\.ts$/, '.service.contract.ts');
      const contractSource = this.exists(contract) ? this.read(contract) : '';
      expect(this.exists(contract), service).toBeTruthy();
      expect(contractSource, contract).toMatch(/export\s+interface\s+I\w+Service/);
      expect(contractSource, contract).toMatch(/new\s+InjectionToken<\s*I\w+Service\s*>/);
    }
  }

  expectFrontendDependencyBoundaries(): void {
    this.run('node', ['tools/check-boundaries.mjs'], 'frontend');
  }

  expectRouteLevelLazyLoading(): void {
    const routes = this.read('frontend/projects/the-health-game/src/app/app.routes.ts');
    expect(routes).toMatch(/load(Component|Children)\s*:/);
    expect(routes).not.toMatch(/import\s+{[^}]*Component[^}]*}\s+from\s+['"]domain['"]/);
  }

  expectHandlersCoveredByTests(): void {
    const handlerFiles = this.filesUnder('backend/src/HealthGame.Application', ['.cs']).filter((file) =>
      /\/(CommandHandlers|QueryHandlers)\//.test(file),
    );
    const testSources = this.filesUnder('backend/tests', ['.cs']).map((file) => this.read(file)).join('\n');
    const uncovered = handlerFiles
      .map((file) => path.basename(file, '.cs'))
      .filter((handler) => !testSources.includes(handler.replace(/Handler$/, '')));

    expect(uncovered).toEqual([]);
  }

  expectCiRunsAutomatedTests(): void {
    expect(this.exists('.github/workflows')).toBeTruthy();
    const workflows = this.filesUnder('.github/workflows', ['.yml', '.yaml']).map((file) => this.read(file)).join('\n');
    expect(workflows).toMatch(/dotnet\s+test/);
    expect(workflows).toMatch(/npm\s+(run\s+)?test|ng\s+test/);
    expect(workflows).toMatch(/playwright\s+test|npm\s+run\s+e2e/);
  }

  expectE2ETestsUsePomAndHeaders(): void {
    const testFiles = this.filesUnder('e2e/tests', ['.ts']).filter((file) => file.endsWith('.spec.ts'));
    const directPageUsage = testFiles.filter((file) =>
      /\bpage\.(locator|getBy[A-Z]\w*|click|fill|goto|press|keyboard|mouse)/.test(this.read(file)),
    );
    const missingHeaders = testFiles.filter(
      (file) => !/^\/\/ Acceptance Test\r?\n\/\/ Traces to: L2-\d{3}(?:,\s*L2-\d{3})*\r?\n\/\/ Description: .+/m.test(this.read(file)),
    );

    expect(directPageUsage).toEqual([]);
    expect(missingHeaders).toEqual([]);
  }

  expectPageObjectsForMockPages(): void {
    const manifest = JSON.parse(this.read('docs/mocks/manifest.json')) as { pages: readonly { id: string }[] };
    const pageObjectSources = this.filesUnder('e2e/pages', ['.ts']).map((file) => this.read(file)).join('\n');
    const missing = manifest.pages
      .map((page) => toClassName(page.id))
      .filter((className) => !new RegExp(`class\\s+${className}\\b`).test(pageObjectSources));

    expect(missing).toEqual([]);
  }

  run(command: string, args: readonly string[], relativeCwd = '.'): string {
    return execFileSync(command, args, {
      cwd: this.file(relativeCwd),
      encoding: 'utf8',
      stdio: 'pipe',
    });
  }
}

function findRepoRoot(): string {
  let current = process.cwd();

  for (let i = 0; i < 6; i += 1) {
    if (existsSync(path.join(current, 'docs/specs')) && existsSync(path.join(current, 'e2e'))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }

    current = parent;
  }

  throw new Error(`Unable to find repository root from ${process.cwd()}`);
}

function toClassName(id: string): string {
  return `${id
    .split(/[-_]/)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('')}Page`;
}
