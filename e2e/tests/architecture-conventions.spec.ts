// Acceptance Test
// Traces to: L2-016, L2-017, L2-023, L2-024, L2-025, L2-026, L2-027, L2-028, L2-029, L2-030, L2-031, L2-032, L2-033, L2-034, L2-035
// Description: Enforces backend, frontend, security, and testing architecture requirements using source-level acceptance checks.
import { test } from '@playwright/test';

import { SourceCodeInspector } from '../pages';

test.describe('architecture and convention gates', () => {
  test('L2-023 enforces Clean Architecture layer references', async () => {
    new SourceCodeInspector().expectCleanArchitectureReferences();
  });

  test('L2-024 enforces SOLID-oriented class responsibility and dependency inversion heuristics', async () => {
    new SourceCodeInspector().expectSolidHeuristics();
  });

  test('L2-025 and L2-026 require ASP.NET Core controllers that dispatch MediatR commands and queries', async () => {
    const inspector = new SourceCodeInspector();
    inspector.expectControllersUseMediatR();
    inspector.expectCommandsAndQueriesHaveHandlers();
  });

  test('L2-027 requires EF Core DbContext persistence against SQL Server with migrations', async () => {
    new SourceCodeInspector().expectEfCoreSqlServerPersistence();
  });

  test('L2-028 requires Microsoft.Extensions logging, configuration, and DI', async () => {
    new SourceCodeInspector().expectMicrosoftExtensionsUsage();
  });

  test('L2-029 requires legacy backend solution structure under backend/src and backend/tests', async () => {
    const inspector = new SourceCodeInspector();
    inspector.expectOldStyleSolution();
    inspector.expectBackendProjectLayout();
  });

  test('L2-030 requires a single Angular workspace, Angular Material UI primitives, and design tokens', async () => {
    const inspector = new SourceCodeInspector();
    inspector.expectFrontendWorkspaceAndLibraries();
    inspector.expectFrontendMaterialAndTokenUsage();
  });

  test('L2-031 requires file-per-type components and BEM class naming', async () => {
    new SourceCodeInspector().expectFrontendComponentFileAndBemConventions();
  });

  test('L2-032 requires interface-driven service consumption with InjectionTokens', async () => {
    new SourceCodeInspector().expectInterfaceDrivenServices();
  });

  test('L2-033 requires frontend library dependency boundaries to be enforced', async () => {
    new SourceCodeInspector().expectFrontendDependencyBoundaries();
  });

  test('L2-034 requires unit, integration, and CI gates for backend handlers and frontend tests', async () => {
    const inspector = new SourceCodeInspector();
    inspector.expectHandlersCoveredByTests();
    inspector.expectCiRunsAutomatedTests();
  });

  test('L2-035 requires Playwright POM usage and L2 trace headers in e2e tests', async () => {
    new SourceCodeInspector().expectE2ETestsUsePomAndHeaders();
  });

  test('L2-016 and L2-017 prohibit string-concatenated SQL and hard-coded secrets', async () => {
    const inspector = new SourceCodeInspector();
    inspector.expectEfCoreSqlServerPersistence();
    inspector.expectNoHardCodedSecrets();
  });
});
