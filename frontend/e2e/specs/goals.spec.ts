// Acceptance Test
// Traces to: 03-TC-V-001..009, 03-TC-C-001..011, 03-TC-L-001
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

    test('goal card titles are Inter 14 px / weight 500 (03-TC-V-004)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const titles = page.locator('lib-goal-list .goal-card__title');
      const count = await titles.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const computed = await titles.nth(i).evaluate((el) => {
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
    });

    test('"New goal" button label is Inter 14 px / 500 / white (03-TC-V-006)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const label = page
        .locator('lib-goal-list .page-header__action button')
        .filter({ hasText: 'New goal' })
        .first();
      await expect(label).toBeVisible();

      const computed = await label.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          color: style.color,
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('14px');
      expect(computed.color).toBe('rgb(255, 255, 255)');
    });

    test('goal card metadata (target) is Inter 12 px / weight 400 (03-TC-V-005)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.goto('/goals');

      const labels = page.locator('lib-goal-list .goal-card__progress-label');
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
        expect(computed.fontWeight).toBe('400');
        expect(computed.fontSize).toBe('12px');
      }
    });

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

  test.describe('empty state', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('empty state heading is Inter 22 px / weight 500 (03-TC-V-007)', async ({ page }) => {
      await authenticate(page);
      await page.unroute('**/api/goals**');
      await page.route('**/api/goals**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );
      await page.goto('/goals');

      const heading = page.locator('lib-goal-list hg-empty-state .empty-state__title').first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText('No goals yet');

      const computed = await heading.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('22px');
    });
  });

  test.describe('goal form', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('Delete confirm button bg #BA1A1A / label #FFFFFF (03-TC-C-011)', async ({ page }) => {
      await authenticate(page);
      await page.route('**/api/goals/g1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'g1',
            name: 'Walk',
            description: '',
            cadence: 'daily',
            target: { value: 10, unit: 'min' },
            completedQuantity: 0,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          }),
        }),
      );
      await page.route('**/api/goals/g1/activity**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );
      await page.goto('/goals/g1');
      await page.locator('[data-testid="goal-detail-delete"]').click();
      const btn = page.locator('[data-testid="delete-goal-confirm"]');
      await expect(btn).toBeVisible();
      const styles = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color };
      });
      expect(styles.bg).toBe('rgb(186, 26, 26)');
      expect(styles.color).toBe('rgb(255, 255, 255)');
    });

    test('"New goal" button bg #006D3F / label #FFFFFF (03-TC-C-010)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const btn = page
        .locator('lib-goal-list .page-header__action button')
        .filter({ hasText: 'New goal' })
        .first();
      await expect(btn).toBeVisible();
      const styles = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color };
      });
      expect(styles.bg).toBe('rgb(0, 109, 63)');
      expect(styles.color).toBe('rgb(255, 255, 255)');
    });

    test('progress bar track is #E5E9E2 (03-TC-C-009)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const track = page
        .locator('lib-goal-list mat-progress-bar .mdc-linear-progress__buffer-bar')
        .first();
      await expect(track).toBeAttached();
      const color = await track.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(color).toBe('rgb(229, 233, 226)');
    });

    test('progress bar fill is #006D3F (03-TC-C-008)', async ({ page }) => {
      await authenticate(page);
      await page.unroute('**/api/goals**');
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
              completedQuantity: 5,
              currentStreak: 0,
              longestStreak: 0,
              rewardName: '',
            },
          ]),
        }),
      );
      await page.goto('/goals');

      const fill = page.locator('lib-goal-list mat-progress-bar .mdc-linear-progress__bar-inner').first();
      await expect(fill).toBeAttached();
      const color = await fill.evaluate((el) => getComputedStyle(el).borderTopColor);
      expect(color).toBe('rgb(0, 109, 63)');
    });

    test('goal card icon backgrounds rotate through container palette (03-TC-C-007)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.unroute('**/api/goals**');
      const baseGoal = {
        description: '',
        cadence: 'daily' as const,
        target: { value: 10, unit: 'min' },
        completedQuantity: 0,
        currentStreak: 0,
        longestStreak: 0,
        rewardName: '',
      };
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Walk', ...baseGoal },
            { id: 'g2', name: 'Read', ...baseGoal },
            { id: 'g3', name: 'Stretch', ...baseGoal },
            { id: 'g4', name: 'Hydrate', ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      const frames = page.locator('lib-goal-list .goal-list__item .goal-card__icon-frame');
      await expect(frames).toHaveCount(4);

      const colors: string[] = [];
      for (let i = 0; i < 4; i++) {
        colors.push(
          await frames.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor),
        );
      }
      const expected = [
        'rgb(148, 247, 180)', // primary container (green)
        'rgb(207, 228, 255)', // tertiary/blue container
        'rgb(255, 220, 196)', // streak container (orange)
        'rgb(255, 215, 238)', // reward container (pink)
      ];
      expect(colors).toEqual(expected);
    });

    test('ready (complete) goal card background is #94F7B4 (03-TC-C-006)', async ({ page }) => {
      await authenticate(page);
      await page.unroute('**/api/goals**');
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
              completedQuantity: 10,
              currentStreak: 0,
              longestStreak: 0,
              rewardName: '',
            },
          ]),
        }),
      );
      await page.goto('/goals');

      const card = page.locator('lib-goal-list .goal-card--complete').first();
      await expect(card).toBeVisible();
      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(148, 247, 180)');
    });

    test('default goal card background is #EBEFE7 (03-TC-C-005)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const card = page
        .locator(
          'lib-goal-list .goal-card:not(.goal-card--complete):not(.goal-card--streak)',
        )
        .first();
      await expect(card).toBeVisible();
      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(235, 239, 231)');
    });

    test('inactive filter chip is transparent / outline #C2C9BE / label #191D17 (03-TC-C-004)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.goto('/goals');

      const inactive = page
        .locator('lib-goal-list mat-button-toggle:not(.mat-button-toggle-checked)')
        .first();
      await expect(inactive).toBeVisible();
      const label = inactive.locator('.segmented-filter__label');

      const bg = await inactive.evaluate((el) => {
        const inner = el.querySelector('.mat-button-toggle-button') ?? el;
        return getComputedStyle(inner).backgroundColor;
      });
      expect(bg).toBe('rgba(0, 0, 0, 0)');

      const outline = await inactive.evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.borderColor, width: s.borderWidth };
      });
      expect(outline.color).toBe('rgb(194, 201, 190)');
      expect(outline.width).toBe('1px');

      const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
      expect(labelColor).toBe('rgb(25, 29, 23)');
    });

    test('active filter chip is #D2E8D4 bg / #0C1F13 label (03-TC-C-003)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const active = page
        .locator('lib-goal-list mat-button-toggle.mat-button-toggle-checked')
        .first();
      await expect(active).toBeVisible();
      const label = active.locator('.segmented-filter__label');
      const styles = await active.evaluate((el) => {
        const inner = el.querySelector('.mat-button-toggle-button') ?? el;
        return getComputedStyle(inner).backgroundColor;
      });
      expect(styles).toBe('rgb(210, 232, 212)');

      const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
      expect(labelColor).toBe('rgb(12, 31, 19)');
    });

    test('top bar background is #F7FBF3 (03-TC-C-002)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      await expect(toolbar).toBeVisible();
      const bg = await toolbar.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(247, 251, 243)');
    });

    test('goals page background is #F1F5ED (03-TC-C-001)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const host = page.locator('lib-goal-list').first();
      await expect(host).toBeVisible();
      const bg = await host.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(241, 245, 237)');
    });

    test('form helper text is Inter 12 px / weight 400 (03-TC-V-009)', async ({ page }) => {
      await authenticate(page);
      await page.route('**/api/goals/g1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'g1',
            name: 'Walk',
            description: '',
            cadence: 'daily',
            target: { value: 10, unit: 'min' },
            completedQuantity: 0,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          }),
        }),
      );
      await page.goto('/goals/g1/edit');

      const cadenceField = page.locator('mat-form-field').filter({ hasText: 'Cadence' });
      await cadenceField.locator('mat-select').click();
      await page.locator('mat-option').filter({ hasText: 'Weekly' }).click();

      const hint = page.locator('mat-hint[data-testid="goal-form-cadence-note"]');
      await expect(hint).toBeVisible();

      const computed = await hint.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
        };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('400');
      expect(computed.fontSize).toBe('12px');
    });

    test('form field labels are Inter 13 px / weight 500 (03-TC-V-008)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals/new');

      const labels = page.locator(
        'form[data-testid="goal-form"] mat-form-field mat-label, ' +
          'form[data-testid="goal-form"] mat-form-field .mat-mdc-floating-label, ' +
          'form[data-testid="goal-form"] mat-form-field .mdc-floating-label',
      );
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
  });

  test.describe('top bar height — viewport responsive (03-TC-L-001)', () => {
    test('desktop top bar is 80 px tall', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const h = await toolbar.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(80);
    });

    test('tablet top bar is 80 px tall', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const h = await toolbar.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(80);
    });

    test('mobile top bar is 64 px tall', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const h = await toolbar.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(64);
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
