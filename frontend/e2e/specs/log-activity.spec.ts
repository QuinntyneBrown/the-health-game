// Acceptance Test
// Traces to: 04-TC-V-001..002
// Description: log-activity dialog typography.
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

const goal = {
  id: 'g1',
  name: 'Walk',
  description: '',
  cadence: 'daily' as const,
  target: { value: 10, unit: 'min' },
  completedQuantity: 0,
  currentStreak: 0,
  longestStreak: 0,
  rewardName: '',
};

test.describe('Log activity dialog (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('dialog field labels are Inter 13 px / weight 500 (04-TC-V-002)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activity**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    const labels = page.locator(
      '.cdk-overlay-container hg-health-text-field mat-label, ' +
        '.cdk-overlay-container hg-health-text-field .mat-mdc-floating-label',
    );
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const computed = await labels.nth(i).evaluate((el) => {
        const s = getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('13px');
    }
  });

  test('dialog title is Inter 22 px / weight 500 (04-TC-V-001)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activity**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');

    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    const title = page.locator('h2[mat-dialog-title]').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveText(/Log activity/i);

    const computed = await title.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize };
    });
    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('500');
    expect(computed.fontSize).toBe('22px');
  });
});
