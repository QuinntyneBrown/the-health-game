// Acceptance Test
// Traces to: 06-TC-V-001..002
// Description: stats + profile page chrome.
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

test.describe('Stats & Profile chrome', () => {
  test('stat headline numbers Inter 32 px / weight 600 (06-TC-V-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const tile = page.locator('lib-stats .stat-tile__value').first();
    await expect(tile).toBeVisible();
    const result = await tile.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('32px');
    expect(result.weight).toBe('600');
  });

  test('page titles "Stats"/"Profile" Inter 32 desktop / 22 mobile / 500 (06-TC-V-001)', async ({
    page,
  }) => {
    await authenticate(page);

    const measureTitle = async (path: string, expected: string) => {
      await page.goto(path);
      const heading = page
        .locator(`${path === '/stats' ? 'lib-stats' : 'lib-profile'} .page-header__title`)
        .first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText(expected);
      return heading;
    };

    await page.setViewportSize({ width: 1280, height: 900 });
    let h = await measureTitle('/stats', 'Stats');
    let r = await h.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(r.family).toMatch(/Inter/);
    expect(r.size).toBe('32px');
    expect(r.weight).toBe('500');

    h = await measureTitle('/profile', 'Profile');
    r = await h.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(r.family).toMatch(/Inter/);
    expect(r.size).toBe('32px');
    expect(r.weight).toBe('500');

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(80);
    const mobile = await page
      .locator('lib-profile .page-header__title')
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(mobile).toBe('22px');
  });
});
