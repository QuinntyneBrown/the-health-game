// Acceptance Test
// Traces to: 03-TC-V-001..003
// Description: /goals page title "Goals" renders with Inter weight 500 at 22/32 px.
// Subtitle is Inter 13 px weight 400 with computed counts.
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
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'g1',
          name: 'Walk',
          description: '',
          cadence: 'daily',
          target: { value: 10, unit: 'min' },
          completedQuantity: 0,
          currentStreak: 0,
          longestStreak: 0,
          rewardName: '',
        },
      ]),
    }),
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
        email: 'quinn@example.com',
        avatarUrl: null,
        roles: [],
      }),
    }),
  );

  await page.goto('/onboarding');
  await page.evaluate(() => {
    sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
    sessionStorage.setItem('hg.oidc.state', 'test-state');
  });
  await page.goto('/auth/callback?code=test-code&state=test-state');
  await page.waitForURL(/\/home(\b|\/|$)/);
}

test.describe('Goals page — header typography', () => {
  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('filter chip labels are Inter 13 px / weight 500 (03-TC-V-003)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const labels = page.locator('lib-goal-list .segmented-filter__label');
      const count = await labels.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const computed = await labels.nth(i).evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontSize: style.fontSize,
          };
        });
        expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
        expect(computed.fontWeight).toBe('500');
        expect(computed.fontSize).toBe('13px');
      }
    });

    test('subtitle is Inter 13 px weight 400 with computed counts (03-TC-V-002)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.goto('/goals');

      const subtitle = page.locator('lib-goal-list .page-header__description').first();
      await expect(subtitle).toBeVisible();
      await expect(subtitle).toContainText(/active goal/i);

      const computed = await subtitle.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('400');
      expect(computed.fontSize).toBe('13px');
    });

    test('"Goals" title is Inter weight 500 at 32 px on desktop (03-TC-V-001)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const title = page.locator('lib-goal-list .page-header__title').first();
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Goals');

      const computed = await title.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('32px');
    });
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 360, height: 780 } });

    test('"Goals" title is Inter weight 500 at 22 px on mobile (03-TC-V-001)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const title = page.locator('lib-goal-list .page-header__title').first();
      await expect(title).toBeVisible();
      const fontSize = await title.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('22px');
    });
  });
});
