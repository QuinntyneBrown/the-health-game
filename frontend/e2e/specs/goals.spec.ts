// Acceptance Test
// Traces to: 03-TC-V-001..009, 03-TC-C-001..011, 03-TC-L-001..011, 03-TC-R-001..006, 03-TC-F-001..011, 03-TC-F-101
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

  test.describe('filter chip layout', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('create goal: empty name blocks submit and shows inline error (03-TC-F-101)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);

      let postCalls = 0;
      await page.route('**/api/goals', (route) => {
        if (route.request().method() === 'POST') {
          postCalls += 1;
          route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
          return;
        }
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.goto('/goals/new');

      const save = page.locator('[data-testid="goal-form-save"]');
      // Required name empty → submit button disabled.
      await expect(save).toBeDisabled();

      // Force-click via attempted submit form to surface inline error.
      await page.locator('input').first().fill('');
      await page.locator('input').first().blur();

      // Provide a target then attempt submission via Enter on a non-required field
      // to trigger validation messaging.
      await page
        .locator('hg-health-text-field')
        .filter({ hasText: 'Target' })
        .locator('input')
        .fill('10');
      await page
        .locator('hg-health-text-field')
        .filter({ hasText: 'Unit' })
        .locator('input')
        .fill('min');
      await expect(save).toBeDisabled();

      // Dispatch submit on the form directly to flip attemptedSubmit and surface the inline error.
      await page
        .locator('form[data-testid="goal-form"]')
        .evaluate((form: HTMLFormElement) => {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });

      const nameField = page.locator('hg-health-text-field').filter({ hasText: 'Name' }).first();
      await expect(nameField).toContainText(/required|name/i);

      expect(postCalls).toBe(0);
    });

    test('streak chip on card reflects currentStreak from API (03-TC-F-011)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      const baseGoal = {
        description: '',
        cadence: 'daily' as const,
        target: { value: 10, unit: 'min' },
        completedQuantity: 0,
        longestStreak: 12,
        rewardName: '',
      };
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Walk', currentStreak: 5, ...baseGoal },
            { id: 'g2', name: 'Read', currentStreak: 0, ...baseGoal, longestStreak: 0 },
          ]),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(2);

      const walkCard = cards.filter({ hasText: 'Walk' }).first();
      const walkChips = await walkCard.locator('mat-chip').allInnerTexts();
      expect(walkChips.some((t) => /5[-\s]?day streak/i.test(t))).toBe(true);

      const readCard = cards.filter({ hasText: 'Read' }).first();
      const readChips = await readCard.locator('mat-chip').allInnerTexts();
      expect(readChips.some((t) => /0[-\s]?day streak/i.test(t))).toBe(true);
    });

    test('clicking a goal card navigates to /goals/{id} (03-TC-F-010)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'abc-123',
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
      await page.route('**/api/goals/abc-123', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'abc-123',
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
      await page.route('**/api/goals/abc-123/activity**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );

      await page.goto('/goals');
      const openBtn = page
        .locator('lib-goal-list .goal-card hg-action-button button')
        .filter({ hasText: 'Open' })
        .first();
      await expect(openBtn).toBeVisible();
      await openBtn.click();

      await expect(page).toHaveURL(/\/goals\/abc-123$/);
      await expect(page.locator('lib-goal-detail [data-testid="goal-detail"]')).toBeVisible();
    });

    test('empty state shows "Create your first goal" CTA when 0 goals (03-TC-F-009)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      await page.route('**/api/goals**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );
      await page.goto('/goals');

      const empty = page.locator('lib-goal-list hg-empty-state');
      await expect(empty).toBeVisible();
      await expect(empty).toContainText('No goals yet');

      const cta = empty.getByRole('button', { name: /create.*goal/i });
      await expect(cta).toBeVisible();

      await cta.click();
      await expect(page).toHaveURL(/\/goals\/new$/);
    });

    test('sort by name: ascending (03-TC-F-008)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
            { id: 'g1', name: 'Charlie', ...baseGoal },
            { id: 'g2', name: 'Alpha', ...baseGoal },
            { id: 'g3', name: 'bravo', ...baseGoal },
            { id: 'g4', name: 'Delta', ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      // Default sort is name → no need to change select
      const titles = await page.locator('lib-goal-list .goal-card__title').allInnerTexts();
      expect(titles).toEqual(['Alpha', 'bravo', 'Charlie', 'Delta']);
    });

    test('sort by recently active: desc lastActivityAt (03-TC-F-007)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
            { id: 'g1', name: 'Walk', lastActivityAt: '2026-05-01T10:00:00Z', ...baseGoal },
            { id: 'g2', name: 'Read', lastActivityAt: '2026-05-09T08:00:00Z', ...baseGoal },
            { id: 'g3', name: 'Stretch', lastActivityAt: '2026-05-05T12:00:00Z', ...baseGoal },
            { id: 'g4', name: 'Hydrate', lastActivityAt: null, ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      const sort = page.locator('lib-goal-list [data-testid="goals-sort"]');
      await sort.selectOption('recent');

      const titles = await page.locator('lib-goal-list .goal-card__title').allInnerTexts();
      expect(titles).toEqual(['Read', 'Stretch', 'Walk', 'Hydrate']);
    });

    test('sort by streak length: desc currentStreak, alpha tiebreak (03-TC-F-006)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      const baseGoal = {
        description: '',
        cadence: 'daily' as const,
        target: { value: 10, unit: 'min' },
        completedQuantity: 0,
        longestStreak: 0,
        rewardName: '',
      };
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Charlie', currentStreak: 3, ...baseGoal },
            { id: 'g2', name: 'Alpha', currentStreak: 5, ...baseGoal },
            { id: 'g3', name: 'Bravo', currentStreak: 5, ...baseGoal },
            { id: 'g4', name: 'Delta', currentStreak: 0, ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      const sort = page.locator('lib-goal-list [data-testid="goals-sort"]');
      await expect(sort).toBeVisible();
      await sort.selectOption('streak');

      const titles = await page.locator('lib-goal-list .goal-card__title').allInnerTexts();
      expect(titles).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
    });

    test('Hourly/Weekly/Monthly/Custom chip counts are accurate (03-TC-F-005)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      const baseGoal = {
        description: '',
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
            { id: 'h1', name: 'H1', cadence: 'hourly', ...baseGoal },
            { id: 'h2', name: 'H2', cadence: 'hourly', ...baseGoal },
            { id: 'h3', name: 'H3', cadence: 'hourly', ...baseGoal },
            { id: 'w1', name: 'W1', cadence: 'weekly', ...baseGoal },
            { id: 'w2', name: 'W2', cadence: 'weekly', ...baseGoal },
            { id: 'm1', name: 'M1', cadence: 'monthly', ...baseGoal },
            { id: 'c1', name: 'C1', cadence: 'custom', ...baseGoal },
            { id: 'c2', name: 'C2', cadence: 'custom', ...baseGoal },
            { id: 'c3', name: 'C3', cadence: 'custom', ...baseGoal },
            { id: 'c4', name: 'C4', cadence: 'custom', ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      await expect(page.locator('lib-goal-list .goal-card')).toHaveCount(10);

      const expectations: Array<{ label: string; count: number }> = [
        { label: 'Hourly', count: 3 },
        { label: 'Weekly', count: 2 },
        { label: 'Monthly', count: 1 },
        { label: 'Custom', count: 4 },
      ];

      for (const { label, count } of expectations) {
        const chip = page
          .locator('lib-goal-list mat-button-toggle')
          .filter({ hasText: new RegExp(`^${label}`) })
          .first();
        const text = (await chip.innerText()).trim();
        expect(text).toMatch(new RegExp(`${label}\\s*\\(?\\s*${count}\\s*\\)?`));
      }
    });

    test('"Daily" chip shows count of daily-cadence goals (03-TC-F-004)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');
      const baseGoal = {
        description: '',
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
            { id: 'g1', name: 'Walk', cadence: 'daily', ...baseGoal },
            { id: 'g2', name: 'Read', cadence: 'daily', ...baseGoal },
            { id: 'g3', name: 'Stretch', cadence: 'weekly', ...baseGoal },
            { id: 'g4', name: 'Hydrate', cadence: 'hourly', ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      await expect(page.locator('lib-goal-list .goal-card')).toHaveCount(4);

      const dailyChip = page
        .locator('lib-goal-list mat-button-toggle')
        .filter({ hasText: /^Daily/ })
        .first();
      const text = (await dailyChip.innerText()).trim();
      expect(text).toMatch(/Daily\s*\(?\s*2\s*\)?/);
    });

    test('"All" chip shows count matching total goals (03-TC-F-003)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
          body: JSON.stringify(
            ['Walk', 'Read', 'Stretch', 'Hydrate'].map((name, i) => ({
              id: `g${i + 1}`,
              name,
              ...baseGoal,
            })),
          ),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(4);

      const allChip = page
        .locator('lib-goal-list mat-button-toggle')
        .filter({ hasText: /^All/ })
        .first();
      await expect(allChip).toBeVisible();
      const text = (await allChip.innerText()).trim();
      expect(text).toMatch(/All\s*\(?\s*4\s*\)?/);
    });

    test('search filters by name case-insensitively (03-TC-F-002)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
            { id: 'g2', name: 'Read books', ...baseGoal },
            { id: 'g3', name: 'Stretch', ...baseGoal },
            { id: 'g4', name: 'Walking meeting', ...baseGoal },
          ]),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(4);

      const search = page.locator('lib-goal-list [data-testid="goals-search"] input');
      await expect(search).toBeVisible();

      await search.fill('wal');
      await expect(cards).toHaveCount(2);
      const lowerTitles = (await cards.locator('.goal-card__title').allInnerTexts()).map((t) =>
        t.toLowerCase(),
      );
      expect(lowerTitles.every((t) => t.includes('wal'))).toBe(true);

      await search.fill('WALK');
      await expect(cards).toHaveCount(2);

      await search.fill('  read  ');
      await expect(cards).toHaveCount(1);
      await expect(cards.first().locator('.goal-card__title')).toHaveText('Read books');

      await search.fill('');
      await expect(cards).toHaveCount(4);
    });

    test('list shows only goals returned by GET /api/goals for the current user (03-TC-F-001)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.unroute('**/api/goals**');

      let bearer = '';
      const requestedUrls: string[] = [];
      await page.route('**/api/goals**', (route) => {
        const req = route.request();
        bearer = req.headers()['authorization'] ?? '';
        requestedUrls.push(req.url());
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mine-1',
              name: 'Mine: walk',
              description: '',
              cadence: 'daily',
              target: { value: 10, unit: 'min' },
              completedQuantity: 0,
              currentStreak: 0,
              longestStreak: 0,
              rewardName: '',
            },
            {
              id: 'mine-2',
              name: 'Mine: read',
              description: '',
              cadence: 'daily',
              target: { value: 30, unit: 'min' },
              completedQuantity: 0,
              currentStreak: 0,
              longestStreak: 0,
              rewardName: '',
            },
          ]),
        });
      });

      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(2);

      const titles = await cards.locator('.goal-card__title').allInnerTexts();
      expect(titles.sort()).toEqual(['Mine: read', 'Mine: walk']);

      // Request was authenticated (so the server can scope to the current user)
      expect(bearer).toMatch(/^Bearer /);
      // No other entity ID in the URL (i.e., we didn't ask for another user's goals)
      requestedUrls.forEach((url) => {
        expect(url).not.toMatch(/userId=|user=/);
      });
    });

    test('detail streaks row stays readable at <576 px without horizontal scroll (03-TC-R-006)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 780 });
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

      const streaks = page.locator('lib-goal-detail .goal-detail__streaks').first();
      await expect(streaks).toBeVisible();
      const sizes = await streaks.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));
      expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);

      const docOverflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(docOverflow.scroll).toBeLessThanOrEqual(docOverflow.client);
    });

    test('long goal names truncate to 1 line + accessible full name (03-TC-R-005)', async ({
      page,
    }) => {
      const longName =
        'Walk thirty thousand steps a day come rain or shine through the entire winter';
      await authenticate(page);
      await page.unroute('**/api/goals**');
      await page.route('**/api/goals**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'g1',
              name: longName,
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
      await page.goto('/goals');

      const title = page.locator('lib-goal-list .goal-card__title').first();
      await expect(title).toBeVisible();
      const layout = await title.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          overflow: style.overflow,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          title: el.getAttribute('title'),
          ariaLabel: el.getAttribute('aria-label'),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        };
      });
      expect(['hidden', 'clip']).toContain(layout.overflow);
      expect(layout.textOverflow).toBe('ellipsis');
      expect(layout.whiteSpace).toBe('nowrap');
      // Truncation actually applied (text overflows the rendered box).
      expect(layout.scrollWidth).toBeGreaterThan(layout.clientWidth);
      // Tooltip / aria-label exposes the full name.
      const accessibleFull = layout.title ?? layout.ariaLabel ?? '';
      expect(accessibleFull).toBe(longName);
    });

    test('mobile filter row scrolls horizontally without clipping (03-TC-R-004)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');

      const scroller = page.locator('lib-goal-list .segmented-filter').first();
      await expect(scroller).toBeVisible();

      const sizes = await scroller.evaluate((el) => ({
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        overflowX: getComputedStyle(el).overflowX,
      }));
      expect(sizes.scrollWidth).toBeGreaterThan(sizes.clientWidth);
      expect(['auto', 'scroll']).toContain(sizes.overflowX);

      const lastChip = page.locator('lib-goal-list mat-button-toggle').last();
      const before = await lastChip.evaluate((el) => el.getBoundingClientRect().left);
      await scroller.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' as ScrollBehavior }));
      await page.waitForTimeout(50);
      const after = await lastChip.evaluate((el) => el.getBoundingClientRect().left);
      expect(after).toBeLessThan(before);
    });

    test('1440 px viewport: 3-column grid + content width <= 1152 (03-TC-R-003)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
          body: JSON.stringify(
            ['Walk', 'Read', 'Stretch', 'Hydrate', 'Sleep', 'Stretch'].map((name, i) => ({
              id: `g${i + 1}`,
              name: `${name}-${i}`,
              ...baseGoal,
            })),
          ),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(6);
      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      );
      const uniqueColumns = Array.from(new Set(lefts));
      expect(uniqueColumns.length).toBe(3);

      const list = page.locator('lib-goal-list .goal-list').first();
      const width = await list.evaluate((el) => Math.round(el.getBoundingClientRect().width));
      expect(width).toBeLessThanOrEqual(1152);
    });

    test('768 px viewport: two-column grid + page-header New goal (03-TC-R-002)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
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
          body: JSON.stringify(
            ['Walk', 'Read', 'Stretch', 'Hydrate'].map((name, i) => ({
              id: `g${i + 1}`,
              name,
              ...baseGoal,
            })),
          ),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(4);
      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      );
      const uniqueColumns = Array.from(new Set(lefts));
      expect(uniqueColumns.length).toBe(2);

      const pill = page
        .locator('lib-goal-list .page-header__action button')
        .filter({ hasText: 'New goal' });
      await expect(pill).toBeVisible();
    });

    test('360 px viewport: single-column list + FAB visible (03-TC-R-001)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
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
          body: JSON.stringify(
            ['Walk', 'Read', 'Stretch'].map((name, i) => ({
              id: `g${i + 1}`,
              name,
              ...baseGoal,
            })),
          ),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(3);
      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      );
      expect(lefts.every((l) => l === lefts[0])).toBe(true);

      const fab = page.locator('lib-goal-list [data-testid="goals-new-fab"]');
      await expect(fab).toBeVisible();
    });

    test('detail view header → streaks → history gap is 24 px (03-TC-L-011)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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

      const header = page.locator('lib-goal-detail hg-page-header').first();
      const streaks = page.locator('lib-goal-detail .goal-detail__streaks').first();
      const history = page.locator('lib-goal-detail .goal-detail__history').first();
      await expect(header).toBeVisible();
      await expect(streaks).toBeVisible();

      const headerBottom = await header.evaluate((el) => el.getBoundingClientRect().bottom);
      const streaksTop = await streaks.evaluate((el) => el.getBoundingClientRect().top);
      expect(Math.round(streaksTop - headerBottom)).toBe(24);

      const streaksBottom = await streaks.evaluate((el) => el.getBoundingClientRect().bottom);
      const historyTop = await history.evaluate((el) => el.getBoundingClientRect().top);
      expect(historyTop - streaksBottom).toBeGreaterThanOrEqual(24);
    });

    test('mobile FAB is 56 px bottom-right with 24 px inset (03-TC-L-010)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');

      const fab = page.locator('lib-goal-list [data-testid="goals-new-fab"]');
      await expect(fab).toBeVisible();
      const box = await fab.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          width: Math.round(r.width),
          height: Math.round(r.height),
          right: Math.round(window.innerWidth - r.right),
          bottom: Math.round(window.innerHeight - r.bottom),
        };
      });
      expect(box.width).toBe(56);
      expect(box.height).toBe(56);
      expect(box.right).toBe(24);
      expect(box.bottom).toBe(24);
    });

    test('desktop grid is 3 cards across with 16 px gap (03-TC-L-009)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
          body: JSON.stringify(
            ['Walk', 'Read', 'Stretch'].map((name, i) => ({
              id: `g${i + 1}`,
              name,
              ...baseGoal,
            })),
          ),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(3);
      const tops = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().top)),
      );
      // All 3 on the same row → identical top
      expect(tops.every((t) => t === tops[0])).toBe(true);

      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      );
      const rights = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().right)),
      );
      const colGaps = [lefts[1] - rights[0], lefts[2] - rights[1]];
      colGaps.forEach((g) => expect(g).toBe(16));
    });

    test('mobile list inter-row gap is 8 px (03-TC-L-008)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
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
          ]),
        }),
      );
      await page.goto('/goals');

      const cards = page.locator('lib-goal-list .goal-card');
      await expect(cards).toHaveCount(3);
      const tops: number[] = await cards.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().top),
      );
      const bottoms: number[] = await cards.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().bottom),
      );
      const gaps: number[] = [];
      for (let i = 1; i < tops.length; i++) {
        gaps.push(Math.round(tops[i] - bottoms[i - 1]));
      }
      gaps.forEach((g) => expect(g).toBe(8));
    });

    test('goal card icon container is 40 px square / pill radius (03-TC-L-007)', async ({
      page,
    }) => {
      await authenticate(page);
      await page.goto('/goals');
      const frame = page.locator('lib-goal-list .goal-card__icon-frame').first();
      await expect(frame).toBeVisible();
      const box = await frame.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return {
          width: Math.round(r.width),
          height: Math.round(r.height),
          radius: parseFloat(s.borderTopLeftRadius),
        };
      });
      expect(box.width).toBe(40);
      expect(box.height).toBe(40);
      expect(box.radius).toBeGreaterThanOrEqual(20);
    });

    test('goal card content padding is 20 px on desktop (03-TC-L-006)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.goto('/goals');
      const content = page.locator('lib-goal-list .goal-card .goal-card__content').first();
      await expect(content).toBeVisible();
      const padding = await content.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
      });
      expect(padding).toEqual(['20px', '20px', '20px', '20px']);
    });

    test('goal card content padding is 20 px on tablet (03-TC-L-006)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authenticate(page);
      await page.goto('/goals');
      const content = page.locator('lib-goal-list .goal-card .goal-card__content').first();
      const padding = await content.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
      });
      expect(padding).toEqual(['20px', '20px', '20px', '20px']);
    });

    test('goal card content padding is 12 px on mobile (03-TC-L-006)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');
      const content = page.locator('lib-goal-list .goal-card .goal-card__content').first();
      const padding = await content.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
      });
      expect(padding).toEqual(['12px', '12px', '12px', '12px']);
    });

    test('goal card corner radius is 16 px (03-TC-L-005)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');
      const card = page.locator('lib-goal-list .goal-card').first();
      await expect(card).toBeVisible();
      const radius = await card.evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).toBe('16px');
    });

    test('chip height is 36 px on desktop (03-TC-L-004)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.goto('/goals');
      const chip = page.locator('lib-goal-list mat-button-toggle').first();
      const h = await chip.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(36);
    });

    test('chip height is 36 px on tablet (03-TC-L-004)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authenticate(page);
      await page.goto('/goals');
      const chip = page.locator('lib-goal-list mat-button-toggle').first();
      const h = await chip.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(36);
    });

    test('chip height is 32 px on mobile (03-TC-L-004)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');
      const chip = page.locator('lib-goal-list mat-button-toggle').first();
      const h = await chip.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      expect(h).toBe(32);
    });

    test('gap between filter chips is 8 px (03-TC-L-003)', async ({ page }) => {
      await authenticate(page);
      await page.goto('/goals');

      const chips = page.locator('lib-goal-list mat-button-toggle');
      await expect(chips.first()).toBeVisible();
      const count = await chips.count();
      expect(count).toBeGreaterThanOrEqual(2);
      const rects = await chips.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right };
        }),
      );
      const gaps: number[] = [];
      for (let i = 1; i < rects.length; i++) {
        gaps.push(Math.round(rects[i].left - rects[i - 1].right));
      }
      gaps.forEach((g) => expect(g).toBe(8));
    });
  });

  test.describe('top bar horizontal padding (03-TC-L-002)', () => {
    test('desktop top bar has 32 px horizontal padding', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const padding = await toolbar.evaluate((el) => {
        const s = getComputedStyle(el);
        return { left: s.paddingLeft, right: s.paddingRight };
      });
      expect(padding.left).toBe('32px');
      expect(padding.right).toBe('32px');
    });

    test('tablet top bar has 32 px horizontal padding', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const padding = await toolbar.evaluate((el) => {
        const s = getComputedStyle(el);
        return { left: s.paddingLeft, right: s.paddingRight };
      });
      expect(padding.left).toBe('32px');
      expect(padding.right).toBe('32px');
    });

    test('mobile top bar has 8 px horizontal padding', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.goto('/goals');
      const toolbar = page.locator('mat-toolbar.app-shell__toolbar').first();
      const padding = await toolbar.evaluate((el) => {
        const s = getComputedStyle(el);
        return { left: s.paddingLeft, right: s.paddingRight };
      });
      expect(padding.left).toBe('8px');
      expect(padding.right).toBe('8px');
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
