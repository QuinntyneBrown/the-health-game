// Acceptance Test
// Traces to: 05-TC-V-001
// Description: rewards list page chrome.
import { expect, test } from '@playwright/test';

async function authenticate(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/connect/token', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    }),
  );
  await page.route('**/api/goals**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/rewards**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/users/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        displayName: 'Quinn',
        email: 'q@q.q',
        avatarUrl: null,
        roles: [],
      }),
    }),
  );

  await page.goto('/onboarding');
  await page.evaluate(() => {
    sessionStorage.setItem('hg.oidc.verifier', 'v');
    sessionStorage.setItem('hg.oidc.state', 's');
  });
  await page.goto('/auth/callback?code=c&state=s');
  await page.waitForURL(/\/home(\b|\/|$)/);
}

const sampleRewards = [
  {
    id: 'r1',
    name: 'New running shoes',
    description: 'Earned by hitting a 10-day streak',
    status: 'earned',
    earnedAt: '2026-05-08T12:00:00Z',
    progress: { current: 10, target: 10 },
    qualifyingGoalId: 'g1',
  },
  {
    id: 'r2',
    name: 'Spa day',
    description: 'Earned by hitting a 30-day streak',
    status: 'in-progress',
    progress: { current: 6, target: 10 },
    qualifyingGoalId: 'g1',
  },
];

test.describe('Rewards list', () => {
  test('page title "Rewards" Inter 32 px desktop weight 500 (05-TC-V-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleRewards),
      }),
    );

    await page.goto('/rewards');
    const heading = page.locator(
      'lib-reward-list .page-header__title, lib-reward-list h1',
    ).first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/^Rewards$/);

    const result = await heading.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
      };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('32px');
    expect(result.weight).toBe('500');

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(80);
    const mobile = await heading.evaluate((el) => getComputedStyle(el).fontSize);
    expect(mobile).toBe('22px');
  });
});
