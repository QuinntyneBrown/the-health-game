// Acceptance Test
// Traces to: 02-TC-V-001..007, 02-TC-C-001
// Description: Dashboard greeting renders with Inter font, weight 500, sizes 22/28/32 px (mobile/tablet/desktop).
// Section labels render with Inter weight 500 at 18 px.
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

  await page.goto('/onboarding');
  await page.evaluate(() => {
    sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
    sessionStorage.setItem('hg.oidc.state', 'test-state');
  });
  await page.goto('/auth/callback?code=test-code&state=test-state');
  await page.waitForURL(/\/home(\b|\/|$)/);
}

test.describe('Home Dashboard — greeting typography', () => {
  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('greeting uses Inter weight 500 at 32 px on desktop (02-TC-V-001)', async ({ page }) => {
      await authenticate(page);

      const greeting = page.locator('.page-header__title').first();
      await expect(greeting).toBeVisible();

      const computed = await greeting.evaluate((el) => {
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

    test('dashboard page background is #F1F5ED (02-TC-C-001)', async ({ page }) => {
      await authenticate(page);

      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      await expect(root).toBeVisible();

      const background = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(background).toBe('rgb(241, 245, 237)');
    });

    test('bar-chart axis text is Inter 11 px / weight 400 (02-TC-V-007)', async ({ page }) => {
      await authenticate(page);

      const axisLabels = page.locator('[data-testid="dashboard-bar-chart"] .bar-chart__axis-label');
      const count = await axisLabels.count();
      expect(count).toBeGreaterThan(0);

      const computed = await axisLabels.first().evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: parseFloat(style.fontWeight),
          fontSize: parseFloat(style.fontSize),
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontSize).toBe(11);
      expect(computed.fontWeight).toBe(400);
    });

    test('goal-card streak chip text is Inter 13 px / weight 500-600 (02-TC-V-006)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'g1',
              name: 'Drink water',
              description: 'Stay hydrated',
              cadence: 'daily',
              target: { value: 8, unit: 'glasses' },
              completedQuantity: 4,
              currentStreak: 3,
              longestStreak: 5,
              rewardName: '',
            },
          ]),
        }),
      );

      await page.goto('/goals');
      const chip = page
        .locator('.goal-card__chips .mdc-evolution-chip__text-label')
        .filter({ hasText: 'streak' })
        .first();
      await expect(chip).toBeVisible();

      const computed = await chip.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: parseFloat(style.fontWeight),
          fontSize: parseFloat(style.fontSize),
        };
      });

      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontSize).toBe(13);
      expect([500, 600]).toContain(computed.fontWeight);
    });

    test('goal/reward card descriptions are Inter 12-13 px / weight 400 (02-TC-V-005)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'g1',
              name: 'Drink water',
              description: 'Stay hydrated',
              cadence: 'daily',
              target: { value: 8, unit: 'glasses' },
              completedQuantity: 4,
              currentStreak: 3,
              longestStreak: 5,
              rewardName: '',
            },
          ]),
        }),
      );
      await page.route('**/api/rewards**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'r1',
              userId: 'u1',
              goalId: 'g1',
              name: 'Movie night',
              description: 'Treat',
              condition: { type: 'goal-target' },
              status: 'pending',
              earnedAt: null,
            },
          ]),
        }),
      );

      const checkRange = async (selector: string): Promise<void> => {
        const el = page.locator(selector).first();
        await expect(el).toBeVisible();
        const computed = await el.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            fontFamily: style.fontFamily,
            fontWeight: parseFloat(style.fontWeight),
            fontSize: parseFloat(style.fontSize),
          };
        });
        expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
        expect(computed.fontWeight).toBe(400);
        expect(computed.fontSize).toBeGreaterThanOrEqual(12);
        expect(computed.fontSize).toBeLessThanOrEqual(13);
      };

      await page.goto('/goals');
      await checkRange('.goal-card__description');

      await page.goto('/rewards');
      await checkRange('.reward-card__description');
    });

    test('goal and reward card titles are Inter 14 px / weight 500 (02-TC-V-004)', async ({
      page,
    }) => {
      await authenticate(page);

      // Override the empty fixtures from authenticate() so /goals + /rewards render at least one card.
      // Playwright runs the most-recently-registered matching route first, so these win.
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'g1',
              name: 'Drink water',
              description: 'Stay hydrated',
              cadence: 'daily',
              target: { value: 8, unit: 'glasses' },
              completedQuantity: 4,
              currentStreak: 3,
              longestStreak: 5,
              rewardName: '',
            },
          ]),
        }),
      );
      await page.route('**/api/rewards**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'r1',
              userId: 'u1',
              goalId: 'g1',
              name: 'Movie night',
              description: 'Treat',
              condition: { type: 'goal-target' },
              status: 'pending',
              earnedAt: null,
            },
          ]),
        }),
      );

      await page.goto('/goals');
      await expect(page.locator('.goal-card__title').first()).toBeVisible();

      const titleSpec = async (selector: string): Promise<void> => {
        const elements = page.locator(selector);
        const count = await elements.count();
        for (let i = 0; i < count; i++) {
          const computed = await elements.nth(i).evaluate((el) => {
            const style = getComputedStyle(el);
            return {
              fontFamily: style.fontFamily,
              fontWeight: style.fontWeight,
              fontSize: style.fontSize,
            };
          });
          expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
          expect(computed.fontWeight).toBe('500');
          expect(computed.fontSize).toBe('14px');
        }
        return undefined;
      };

      await titleSpec('.goal-card__title');

      await page.goto('/rewards');
      await expect(page.locator('.reward-card__name').first()).toBeVisible();
      await titleSpec('.reward-card__name');
    });

    test('stat number values are Inter 28-32 px, weight 500-600 (02-TC-V-003)', async ({ page }) => {
      await authenticate(page);

      const values = page.locator('.metric-card__value');
      const count = await values.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const computed = await values.nth(i).evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            fontFamily: style.fontFamily,
            fontWeight: parseFloat(style.fontWeight),
            fontSize: parseFloat(style.fontSize),
          };
        });
        expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
        expect(computed.fontSize).toBeGreaterThanOrEqual(28);
        expect(computed.fontSize).toBeLessThanOrEqual(32);
        expect([500, 600]).toContain(computed.fontWeight);
      }
    });

    test('section labels use Inter weight 500 at 18 px (02-TC-V-002)', async ({ page }) => {
      await authenticate(page);

      const sectionTitles = page.locator('.section-header__title');
      const count = await sectionTitles.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const title = sectionTitles.nth(i);
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
        expect(computed.fontSize).toBe('18px');
      }
    });
  });

  test.describe('tablet viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('greeting uses Inter weight 500 at 28 px on tablet (02-TC-V-001)', async ({ page }) => {
      await authenticate(page);

      const greeting = page.locator('.page-header__title').first();
      await expect(greeting).toBeVisible();

      const fontSize = await greeting.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('28px');
    });
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 360, height: 780 } });

    test('greeting uses Inter weight 500 at 22 px on mobile (02-TC-V-001)', async ({ page }) => {
      await authenticate(page);

      const greeting = page.locator('.page-header__title').first();
      await expect(greeting).toBeVisible();

      const fontSize = await greeting.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('22px');
    });
  });
});
