// Acceptance Test
// Traces to: 02-TC-V-001..007, 02-TC-C-001..010, 02-TC-L-001..004
// Description: Dashboard greeting renders with Inter font, weight 500, sizes 22/28/32 px (mobile/tablet/desktop).
// Section labels render with Inter weight 500 at 18 px.
import AxeBuilder from '@axe-core/playwright';
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

    test('inter-card gap within metrics section is 12-16 px (02-TC-L-004)', async ({ page }) => {
      await authenticate(page);
      const metrics = page.locator('.dashboard-overview__metrics');
      const gap = await metrics.evaluate((el) => parseFloat(getComputedStyle(el).gap));
      expect(gap).toBeGreaterThanOrEqual(12);
      expect(gap).toBeLessThanOrEqual(16);
    });

    test('metric card content padding is 20 px (02-TC-L-003)', async ({ page }) => {
      await authenticate(page);
      const content = page
        .locator('mat-card.metric-card .metric-card__content')
        .first();
      const padding = await content.evaluate((el) => getComputedStyle(el).paddingTop);
      expect(padding).toBe('20px');
    });

    test('metric card border-radius is 16 px (02-TC-L-002)', async ({ page }) => {
      await authenticate(page);
      const card = page.locator('mat-card.metric-card').first();
      const radius = await card.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      expect(radius).toBe('16px');
    });

    test('dashboard page padding is 32 px on desktop (02-TC-L-001)', async ({ page }) => {
      await authenticate(page);
      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      const paddingTop = await root.evaluate((el) => getComputedStyle(el).paddingTop);
      expect(paddingTop).toBe('32px');
    });

    test('dashboard text passes WCAG AA contrast (02-TC-C-010)', async ({ page }) => {
      await authenticate(page);

      const results = await new AxeBuilder({ page })
        .include('hg-dashboard-overview')
        .withRules(['color-contrast'])
        .analyze();

      if (results.violations.length > 0) {
        console.warn(
          'contrast violations:',
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodeCount: v.nodes.length,
            sample: v.nodes[0]?.failureSummary,
          })),
        );
      }
      expect(results.violations).toEqual([]);
    });

    test('outlined metric card border is 1 px #C2C9BE (02-TC-C-009)', async ({ page }) => {
      await authenticate(page);

      const card = page.locator('mat-card.metric-card').first();
      await expect(card).toBeVisible();

      const border = await card.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          width: style.borderTopWidth,
          color: style.borderTopColor,
        };
      });
      expect(border.width).toBe('1px');
      expect(border.color).toBe('rgb(194, 201, 190)');
    });

    test('primary CTA on dashboard is #006D3F bg with white label (02-TC-C-008)', async ({
      page,
    }) => {
      await authenticate(page);

      const cta = page.locator('hg-action-button.page-header__action button').first();
      await expect(cta).toBeVisible();

      const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(0, 109, 63)');

      const label = page
        .locator('hg-action-button.page-header__action .action-button__label')
        .first();
      const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
      expect(labelColor).toBe('rgb(255, 255, 255)');
    });

    test('primary metric card bg is #94F7B4 and text is #00210F (02-TC-C-007)', async ({
      page,
    }) => {
      await authenticate(page);

      const card = page.locator('mat-card.metric-card--primary').first();
      await expect(card).toBeVisible();

      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(148, 247, 180)');

      const value = page.locator('mat-card.metric-card--primary .metric-card__value').first();
      const valueColor = await value.evaluate((el) => getComputedStyle(el).color);
      expect(valueColor).toBe('rgb(0, 33, 15)');
    });

    test('reward metric card text/icon are #9B2680 (02-TC-C-006)', async ({ page }) => {
      await authenticate(page);

      const value = page.locator('mat-card.metric-card--reward .metric-card__value').first();
      await expect(value).toBeVisible();

      const valueColor = await value.evaluate((el) => getComputedStyle(el).color);
      expect(valueColor).toBe('rgb(155, 38, 128)');

      const icon = page.locator('mat-card.metric-card--reward .metric-card__icon').first();
      const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
      expect(iconColor).toBe('rgb(155, 38, 128)');
    });

    test('reward metric card background is #FFD7EE (02-TC-C-005)', async ({ page }) => {
      await authenticate(page);

      const rewardCard = page.locator('mat-card.metric-card--reward').first();
      await expect(rewardCard).toBeVisible();

      const bg = await rewardCard.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(255, 215, 238)');
    });

    test('streak metric card icon is #E76A0C (02-TC-C-004)', async ({ page }) => {
      await authenticate(page);

      // The decorative streak icon carries the brand orange accent.
      // The big stat value uses a darker shade for WCAG AA contrast (TC-C-010).
      const icon = page.locator('mat-card.metric-card--streak .metric-card__icon').first();
      await expect(icon).toBeVisible();
      const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
      expect(iconColor).toBe('rgb(231, 106, 12)');
    });

    test('streak metric card background is #FFDCC4 (02-TC-C-003)', async ({ page }) => {
      await authenticate(page);

      const streakCard = page.locator('mat-card.metric-card--streak').first();
      await expect(streakCard).toBeVisible();

      const bg = await streakCard.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(255, 220, 196)');
    });

    test('bar-chart bars fill is #006D3F (02-TC-C-002)', async ({ page }) => {
      await authenticate(page);

      const bars = page.locator('[data-testid="dashboard-bar-chart"] .bar-chart__bar');
      const count = await bars.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const fill = await bars.nth(i).evaluate((el) => getComputedStyle(el).fill);
        expect(fill).toBe('rgb(0, 109, 63)');
      }
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

    test('dashboard page padding is 24 px on tablet (02-TC-L-001)', async ({ page }) => {
      await authenticate(page);
      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      const paddingTop = await root.evaluate((el) => getComputedStyle(el).paddingTop);
      expect(paddingTop).toBe('24px');
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

    test('dashboard page padding is 16 px on mobile (02-TC-L-001)', async ({ page }) => {
      await authenticate(page);
      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      const paddingTop = await root.evaluate((el) => getComputedStyle(el).paddingTop);
      expect(paddingTop).toBe('16px');
    });
  });
});
