// Acceptance Test
// Traces to: L2-008, L2-020, L2-021, L2-035
// Description: Verifies mocked screens have page objects and remain responsive, accessible, and POM-driven.
import { test, type Page } from '@playwright/test';

import {
  ActivityManagementPage,
  AdminErrorStatesPage,
  BasePage,
  CreateAccountPage,
  DashboardPage,
  GoalDeletePage,
  GoalDetailPage,
  GoalFormPage,
  GoalsEmptyPage,
  GoalsListPage,
  LogActivityPage,
  OnboardingPage,
  ProfilePage,
  ResetPasswordPage,
  RewardFormPage,
  RewardsListPage,
  SessionStatesPage,
  SignInPage,
  SourceCodeInspector,
  StatsPage,
} from '../pages';

const mockPages: readonly { readonly id: string; readonly create: (page: Page) => BasePage }[] = [
  { id: 'onboarding', create: (page) => new OnboardingPage(page) },
  { id: 'sign-in', create: (page) => new SignInPage(page) },
  { id: 'create-account', create: (page) => new CreateAccountPage(page) },
  { id: 'reset-password', create: (page) => new ResetPasswordPage(page) },
  { id: 'session-states', create: (page) => new SessionStatesPage(page) },
  { id: 'dashboard', create: (page) => new DashboardPage(page) },
  { id: 'goals-empty', create: (page) => new GoalsEmptyPage(page) },
  { id: 'goals-list', create: (page) => new GoalsListPage(page) },
  { id: 'goal-detail', create: (page) => new GoalDetailPage(page) },
  { id: 'goal-form', create: (page) => new GoalFormPage(page) },
  { id: 'goal-delete', create: (page) => new GoalDeletePage(page) },
  { id: 'log-activity', create: (page) => new LogActivityPage(page) },
  { id: 'activity-management', create: (page) => new ActivityManagementPage(page) },
  { id: 'rewards-list', create: (page) => new RewardsListPage(page) },
  { id: 'reward-form', create: (page) => new RewardFormPage(page) },
  { id: 'stats', create: (page) => new StatsPage(page) },
  { id: 'profile', create: (page) => new ProfilePage(page) },
  { id: 'admin-error-states', create: (page) => new AdminErrorStatesPage(page) },
];

const breakpoints = [
  { name: 'XS', width: 375, height: 812 },
  { name: 'S', width: 640, height: 900 },
  { name: 'M', width: 820, height: 1180 },
  { name: 'L', width: 1024, height: 768 },
  { name: 'XL', width: 1440, height: 900 },
] as const;

test.describe('mocked page object and responsive UI coverage', () => {
  test('L2-035 defines a page object for every page identified in docs/mocks/manifest.json', async () => {
    new SourceCodeInspector().expectPageObjectsForMockPages();
  });

  test('L2-020 renders every mocked screen across XS, S, M, L, and XL without horizontal overflow', async ({
    page,
  }) => {
    for (const breakpoint of breakpoints) {
      for (const mockPage of mockPages) {
        const screen = mockPage.create(page);
        await screen.authenticateAs(`responsive-${mockPage.id}`, { roles: mockPage.id.includes('admin') ? ['User'] : ['User'] });
        await screen.setViewport(breakpoint.width, breakpoint.height);
        await screen.goto();
        await screen.expectLoaded();
        await screen.expectNoHorizontalOverflow();
      }
    }
  });

  test('L2-021 exposes accessible names, labels, contrast, and keyboard focus on primary screens', async ({
    page,
  }) => {
    for (const mockPage of mockPages) {
      const screen = mockPage.create(page);
      await screen.authenticateAs(`a11y-${mockPage.id}`);
      await screen.goto();
      await screen.expectLoaded();
      await screen.expectInteractiveControlsHaveAccessibleNames();
      await screen.expectFormFieldsHaveProgrammaticLabels();
      await screen.expectMinimumContrast();
    }

    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.expectKeyboardReachable(/sign in/i);
    await signIn.expectKeyboardActivation(/sign in/i);

    const goals = new GoalsListPage(page);
    await goals.authenticateAs('a11y-keyboard-goals');
    await goals.goto();
    await goals.expectKeyboardReachable(/create goal/i);
    await goals.expectKeyboardActivation(/create goal/i);
  });

  test('L2-008 keeps streak summaries visible in list and detail at mobile sizes', async ({ page }) => {
    const goals = new GoalsListPage(page);
    const detail = new GoalDetailPage(page);

    await goals.authenticateAs('streak-ui-mobile');
    await goals.setViewport(375, 812);
    await goals.goto();
    await goals.expectCurrentStreakVisible('Morning walk', 0);
    await goals.expectNoHorizontalOverflow();

    await detail.authenticateAs('streak-ui-mobile');
    await detail.setViewport(375, 812);
    await detail.goto();
    await detail.expectGoalSummary({
      name: 'Morning walk',
      description: '30 minutes outside',
      target: /30.*minutes/i,
      cadence: /daily/i,
      currentStreak: 0,
      longestStreak: 0,
    });
    await detail.expectNoHorizontalOverflow();
  });
});
