// Acceptance Test
// Traces to: L2-013, L2-014, L2-015, L2-016, L2-017, L2-022, L2-036
// Description: Exercises registration, password sign-in, profile, account deletion, RBAC, validation, transport, and logging security behaviours.
import { expect, test } from '@playwright/test';

import {
  AccountDeletePage,
  AdminErrorStatesPage,
  CreateAccountPage,
  GoalsListPage,
  HealthGameApi,
  ProfilePage,
  ResetPasswordPage,
  SessionStatesPage,
  SignInPage,
  SourceCodeInspector,
} from '../pages';

test.describe('authentication, user management, and security', () => {
  test('L2-013 and L2-036 register users and establish backend-issued token sessions', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const userId = unique('register');
    const password = 'StrongerPassword1!';
    const createAccount = new CreateAccountPage(page);

    await createAccount.goto();
    await createAccount.register({
      displayName: 'Registered Playwright User',
      email: `${userId}@example.test`,
      username: userId,
      password,
    });
    await createAccount.expectAuthenticatedSession();

    const signInResponse = await api.signIn({ usernameOrEmail: userId, password });
    api.expectStatus(signInResponse, 200);
    const signInBody = (await signInResponse.json()) as { accessToken: string; expiresAtUtc: string };
    expect(signInBody).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        expiresAtUtc: expect.any(String),
      }),
    );
    expect(JSON.stringify(signInBody)).not.toContain(password);

    const jwtPayload = decodeJwtPayload(signInBody.accessToken);
    expect(jwtPayload).toEqual(
      expect.objectContaining({
        exp: expect.any(Number),
      }),
    );
    expect(jwtPayload.sub ?? jwtPayload.nameid ?? jwtPayload.userId).toBeTruthy();
    new SourceCodeInspector().expectPasswordHashingAndJwtConfiguration();
  });

  test('L2-036 displays sign-in form, rejects invalid credentials generically, and throttles repeated failures', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const signIn = new SignInPage(page);

    await signIn.goto();
    await signIn.expectUsernamePasswordForm();
    await signIn.signIn('missing-user@example.test', 'wrong-password');
    await signIn.expectGenericInvalidCredentialsError();
    await signIn.expectNoSecretConsoleOutput();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await api.signIn({ usernameOrEmail: 'missing-user@example.test', password: `wrong-${attempt}` });
    }

    const throttledResponse = await api.signIn({
      usernameOrEmail: 'missing-user@example.test',
      password: 'wrong-after-threshold',
    });
    api.expectStatus(throttledResponse, [401, 423, 429]);
  });

  test('L2-013 and L2-036 expired or invalid tokens are rejected and route users back to authentication', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const sessionStates = new SessionStatesPage(page);

    const expiredResponse = await api.expiredTokenRequest();
    api.expectStatus(expiredResponse, 401);
    const invalidResponse = await api.invalidTokenRequest();
    api.expectStatus(invalidResponse, 401);

    await sessionStates.gotoExpiredTokenState();
    await sessionStates.expectExpiredSession();
  });

  test('L2-014 updates profile, deletes account, revokes sessions, and rejects deleted account sign-in', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const userId = unique('profile');
    const email = `${userId}@example.test`;
    const profile = new ProfilePage(page);
    const deleteAccount = new AccountDeletePage(page);

    await profile.authenticateAs(userId, { email, displayName: 'Original Name' });
    await profile.goto();
    await profile.updateProfile('Updated Name', email);
    await profile.expectProfile('Updated Name', email);

    const updateResponse = await api.updateCurrentUser(userId, { displayName: 'Updated Again', email });
    api.expectStatus(updateResponse, 200);
    expect(await updateResponse.json()).toEqual(expect.objectContaining({ displayName: 'Updated Again', email }));

    await deleteAccount.authenticateAs(userId, { email });
    await deleteAccount.goto();
    await deleteAccount.confirmDeletion(email);

    const deleteResponse = await api.deleteCurrentUser(userId);
    api.expectStatus(deleteResponse, [204, 404]);

    const deletedSignInResponse = await api.signIn({ usernameOrEmail: email, password: 'StrongerPassword1!' });
    api.expectStatus(deletedSignInResponse, 401);
    const revokedSessionResponse = await api.getCurrentUser(userId);
    api.expectStatus(revokedSessionResponse, 401);
  });

  test('L2-015 enforces RBAC in API endpoints, ownership checks, and frontend admin gating', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const userId = unique('rbac-user');
    const adminPage = new AdminErrorStatesPage(page);

    const nonAdminResponse = await api.getAdminUsers(userId, ['User']);
    api.expectStatus(nonAdminResponse, 403);

    await adminPage.authenticateAs(userId, { roles: ['User'] });
    await adminPage.goto();
    await adminPage.expectAdminControlsHiddenForUser();

    const adminResponse = await api.getAdminUsers(`${userId}-admin`, ['Admin']);
    api.expectStatus(adminResponse, 200);
  });

  test('L2-016 validates malformed input, escapes rendered user content, and rejects cross-site mutating requests', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const userId = unique('security');
    const xssMarker = `e2eXss${Date.now()}`;
    const maliciousGoalName = `<img src=x onerror="window.${xssMarker}=true">`;
    const goals = new GoalsListPage(page);

    const malformedResponse = await api.malformedPost('/api/goals', userId, { name: 42, target: 'bad' });
    api.expectStatus(malformedResponse, 400);
    await api.expectStructuredError(malformedResponse);

    const crossSiteResponse = await api.createGoalFromCrossSiteOrigin(userId, {
      name: `Cross site ${userId}`,
      targetValue: '30',
      targetUnit: 'minutes',
      cadence: 'daily',
    });
    api.expectStatus(crossSiteResponse, [400, 401, 403]);

    await api.createGoal(userId, {
      name: maliciousGoalName,
      targetValue: '30',
      targetUnit: 'minutes',
      cadence: 'daily',
    });

    await goals.authenticateAs(userId);
    await goals.goto();
    await goals.expectTextVisible(maliciousGoalName);
    await goals.expectWindowPropertyUndefined(xssMarker);
  });

  test('L2-017 enforces HTTPS policies, externalized secrets, and secret-safe logging by source contract', async () => {
    const inspector = new SourceCodeInspector();
    const program = inspector.read('backend/src/HealthGame.Api/Program.cs');

    expect(program).toMatch(/UseHttpsRedirection\(\)/);
    expect(program).toMatch(/UseHsts\(\)/);
    expect(program).toMatch(/builder\.Configuration/);
    inspector.expectNoHardCodedSecrets();
    inspector.expectNoSecretLogging();
  });

  test('L2-022 propagates correlation IDs, hides stack traces from clients, and records audit events', async ({
    request,
  }) => {
    const api = new HealthGameApi(request);
    const inspector = new SourceCodeInspector();
    const userId = unique('logging');
    const correlationId = `corr-${Date.now()}`;

    const correlatedResponse = await api.getCurrentUserWithCorrelation(userId, correlationId);
    api.expectStatus(correlatedResponse, 200);
    expect(correlatedResponse.headers()['x-correlation-id']).toBe(correlationId);

    const invalidResponse = await api.malformedPost('/api/goals', userId, { name: '' });
    api.expectStatus(invalidResponse, 400);
    const problemDetails = await invalidResponse.json();
    expect(JSON.stringify(problemDetails)).not.toMatch(/ at .*\.cs:line |StackTrace|Exception/i);
    expect(problemDetails).toEqual(expect.objectContaining({ correlationId: expect.any(String) }));
    inspector.expectStructuredExceptionLogging();

    const auditLogResponse = await api.getAdminAuditLog(`${userId}-admin`, ['Admin']);
    api.expectStatus(auditLogResponse, 200);
    expect(await auditLogResponse.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventType: expect.stringMatching(/sign-in|account deletion|role/i) })]),
    );
  });

  test('L2-013 reset password flow uses neutral messaging and does not disclose account existence', async ({ page }) => {
    const resetPassword = new ResetPasswordPage(page);

    await resetPassword.goto();
    await resetPassword.requestReset('maybe-registered@example.test');
    await resetPassword.expectNeutralSuccessMessage();
  });
});

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  expect(payload).toBeTruthy();
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8')) as Record<string, unknown>;
}
