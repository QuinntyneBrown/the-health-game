// Acceptance Test
// Traces to: docs/mocks/manifest.json
// Description: The app project is a thin router composition layer over the
//              domain mock screens rather than owning screen implementation.
import { expect, test } from '@playwright/test';

import { MockAppPage } from '../pages/MockAppPage';

test.describe('Mock-driven app routing', () => {
  test('renders primary mock screens from the domain library without app-owned shell UI', async ({
    page,
  }) => {
    const app = new MockAppPage(page);

    await app.goto('/home');
    await app.expectScreen('dashboard', 'Home dashboard');
    await expect(page.getByRole('heading', { name: 'Good morning, Quinn' })).toBeVisible();
    await expect(app.appShellToolbar()).toHaveCount(0);

    await app.goto('/goals/morning-walk');
    await app.expectScreen('goal-detail', 'Goal detail');

    await app.goto('/rewards');
    await app.expectScreen('rewards-list', 'Rewards list');

    await app.goto('/profile');
    await app.expectScreen('profile', 'Profile');
  });

  test('exposes auth and onboarding mock routes from the domain library', async ({ page }) => {
    const app = new MockAppPage(page);

    await app.goto('/onboarding');
    await app.expectScreen('onboarding', 'Onboarding');

    await app.goto('/sign-in');
    await app.expectScreen('sign-in', 'Sign in');

    await app.goto('/register');
    await app.expectScreen('create-account', 'Create account');

    await app.goto('/password-reset');
    await app.expectScreen('reset-password', 'Reset password');

    await app.goto('/auth/signed-out');
    await app.expectScreen('session-states', 'Session states');
  });
});
