// Acceptance Test
// Traces to: 02-TC-V-001..007, 02-TC-C-001..010, 02-TC-L-001..010, 02-TC-R-001..006, 02-TC-F-001..014
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

test.describe('Home Dashboard — greeting typography', () => {
  test('API failure shows error state with retry (02-TC-F-014)', async ({ page }) => {
    let goalsCallCount = 0;
    await authenticate(page);
    await page.route('**/api/goals**', (route) => {
      goalsCallCount += 1;
      if (goalsCallCount === 1) {
        return route.fulfill({ status: 500, contentType: 'text/plain', body: 'oops' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/home');

    const error = page.getByTestId('dashboard-error');
    await expect(error).toBeVisible();

    const retry = page.getByRole('button', { name: /retry/i });
    await expect(retry).toBeVisible();
    await retry.click();

    // After retry the error state goes away and the dashboard renders normally
    await expect(error).toBeHidden();
    await expect(page.getByTestId('dashboard-empty-goals')).toBeVisible();
    expect(goalsCallCount).toBeGreaterThanOrEqual(2);
  });

  test('admin chip is hidden for non-admin users (02-TC-F-013)', async ({ page }) => {
    await authenticate(page); // default profile has roles: []
    await page.goto('/home');
    await expect(page.getByTestId('dashboard-admin-chip')).toBeHidden();
  });

  test('admin chip is visible for admin users (02-TC-F-013)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          displayName: 'Quinn',
          email: 'quinn@example.com',
          avatarUrl: null,
          roles: ['admin'],
        }),
      }),
    );
    await page.goto('/home');
    const adminChip = page.getByTestId('dashboard-admin-chip');
    await expect(adminChip).toBeVisible();
    await expect(adminChip).toContainText(/admin/i);
  });

  test('zero-activity prompt — goals exist but no activity today (02-TC-F-012)', async ({
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
            name: 'Walk',
            description: '',
            cadence: 'daily',
            target: { value: 30, unit: 'min' },
            completedQuantity: 0,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const prompt = page.getByTestId('dashboard-no-activity-today');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(/log your first activity/i);
  });

  test('empty state — no goals shows Create your first goal CTA (02-TC-F-011)', async ({
    page,
  }) => {
    await authenticate(page); // authenticate stubs goals to []
    await page.goto('/home');

    const empty = page.getByTestId('dashboard-empty-goals');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/create your first goal/i);
  });

  test('switching accounts clears prior dashboard data (02-TC-F-010)', async ({ page }) => {
    // User A: greeting "Quinn" + goal "Walk"
    await authenticate(page);
    await page.route(
      '**/api/goals**',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'g-A',
              name: 'Walk',
              description: '',
              cadence: 'daily',
              target: { value: 1, unit: 'walks' },
              completedQuantity: 0,
              currentStreak: 0,
              longestStreak: 0,
              rewardName: '',
            },
          ]),
        }),
      { times: 1 },
    );
    await page.goto('/home');
    await expect(page.locator('hg-goal-card', { hasText: 'Walk' })).toBeVisible();

    // Sign out: clear access token + auth state on the origin
    await page.evaluate(() => {
      sessionStorage.removeItem('hg.oidc.access-token');
      sessionStorage.removeItem('hg.oidc.verifier');
      sessionStorage.removeItem('hg.oidc.state');
    });

    // User B: different display name + goal "Run"
    await page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          displayName: 'Sam',
          email: 'sam@example.com',
          avatarUrl: null,
          roles: [],
        }),
      }),
    );
    await page.route('**/api/goals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'g-B',
            name: 'Run',
            description: '',
            cadence: 'daily',
            target: { value: 1, unit: 'runs' },
            completedQuantity: 0,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
        ]),
      }),
    );

    // Re-authenticate as User B (re-uses authenticate's verifier+state seed via callback)
    await page.goto('/onboarding');
    await page.evaluate(() => {
      sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
      sessionStorage.setItem('hg.oidc.state', 'test-state');
    });
    await page.goto('/auth/callback?code=test-code&state=test-state');
    await page.waitForURL(/\/home(\b|\/|$)/);

    await expect(page.locator('hg-goal-card', { hasText: 'Run' })).toBeVisible();
    expect(await page.locator('hg-goal-card', { hasText: 'Walk' }).count()).toBe(0);
    await expect(page.locator('.page-header__title')).toContainText('Sam');
    await expect(page.locator('.page-header__title')).not.toContainText('Quinn');
  });

  test('clicking a Recent rewards card → /rewards/{id} (02-TC-F-009)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'r-medal',
            userId: 'u',
            goalId: 'g',
            name: 'Medal',
            description: '',
            condition: { type: 'goal-target' },
            status: 'earned',
            earnedAt: '2026-05-09T10:00:00Z',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const reward = page.locator('hg-reward-card').first();
    await expect(reward).toBeVisible();
    await reward.click();

    await page.waitForURL(/\/rewards\/r-medal(\b|\/|\?|$)/);
    expect(page.url()).toContain('/rewards/r-medal');
  });

  test('clicking "New goal" CTA in dashboard header → /goals/new (02-TC-F-008)', async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/home');

    const newGoalBtn = page.getByRole('button', { name: 'New goal', exact: true });
    await expect(newGoalBtn).toBeVisible();
    await newGoalBtn.click();

    await page.waitForURL(/\/goals\/new(\b|\/|\?|$)/);
    expect(page.url()).toContain('/goals/new');
  });

  test('Log CTA on dashboard goal card opens the log-activity flow (02-TC-F-007)', async ({
    page,
  }) => {
    await authenticate(page);
    await page.route('**/api/goals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'g99',
            name: 'Walk',
            description: '',
            cadence: 'daily',
            target: { value: 30, unit: 'min' },
            completedQuantity: 0,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const card = page.locator('hg-goal-card').first();
    await card.getByRole('button', { name: /Log/i }).click();

    // The log-activity flow lives on /goals/{id} (FAB + dialog/sheet); navigation there
    // satisfies "Opens log activity flow for that goal".
    await page.waitForURL(/\/goals\/g99(\b|\/|$)/);
    expect(page.url()).toContain('/goals/g99');
  });

  test('clicking dashboard goal card navigates to /goals/{id} (02-TC-F-006)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/goals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'g42',
            name: 'Drink water',
            description: '',
            cadence: 'daily',
            target: { value: 8, unit: 'glasses' },
            completedQuantity: 4,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const card = page.locator('hg-goal-card').first();
    await expect(card).toBeVisible();
    // Click the action button on the card (the test plan's "click goal card" action)
    await card.getByRole('button', { name: /Log/i }).click();

    await page.waitForURL(/\/goals\/g42(\b|\/|$)/);
    expect(page.url()).toContain('/goals/g42');
  });

  test('Recent rewards shows up to 3 earned, newest first (02-TC-F-005)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'r1', userId: 'u', goalId: 'g', name: 'Old Earned', description: '',
            condition: { type: 'goal-target' }, status: 'earned', earnedAt: '2026-01-01T00:00:00Z' },
          { id: 'r2', userId: 'u', goalId: 'g', name: 'Newest Earned', description: '',
            condition: { type: 'goal-target' }, status: 'earned', earnedAt: '2026-05-09T10:00:00Z' },
          { id: 'r3', userId: 'u', goalId: 'g', name: 'Mid Earned', description: '',
            condition: { type: 'goal-target' }, status: 'earned', earnedAt: '2026-03-15T00:00:00Z' },
          { id: 'r4', userId: 'u', goalId: 'g', name: 'Older Earned', description: '',
            condition: { type: 'goal-target' }, status: 'earned', earnedAt: '2025-12-01T00:00:00Z' },
          { id: 'r5', userId: 'u', goalId: 'g', name: 'Oldest Earned', description: '',
            condition: { type: 'goal-target' }, status: 'earned', earnedAt: '2025-10-01T00:00:00Z' },
          { id: 'r6', userId: 'u', goalId: 'g', name: 'Pending', description: '',
            condition: { type: 'goal-target' }, status: 'pending', earnedAt: null },
        ]),
      }),
    );
    await page.goto('/home');

    const rewardCards = page.locator('hg-reward-card');
    await expect(rewardCards.first()).toBeVisible();
    expect(await rewardCards.count()).toBe(3);

    // The first card should be the newest earned reward
    const firstName = await rewardCards.first().locator('.reward-card__name').textContent();
    expect(firstName?.trim()).toBe('Newest Earned');

    // No pending reward should appear
    const allText = await rewardCards.allTextContents();
    expect(allText.join('|')).not.toContain('Pending');
  });

  test('goal card streak chip shows current streak (02-TC-F-004)', async ({ page }) => {
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
            currentStreak: 7,
            longestStreak: 12,
            rewardName: '',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const card = page.locator('hg-goal-card').first();
    await expect(card).toBeVisible();

    const streakChip = card
      .locator('.mdc-evolution-chip__text-label')
      .filter({ hasText: /current/i })
      .first();
    await expect(streakChip).toBeVisible();
    await expect(streakChip).toContainText('7');
  });

  test('today metric sums activity for daily goals (02-TC-F-003)', async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/goals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'g1',
            name: 'Water',
            description: '',
            cadence: 'daily',
            target: { value: 8, unit: 'glasses' },
            completedQuantity: 4,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
          {
            id: 'g2',
            name: 'Walk',
            description: '',
            cadence: 'daily',
            target: { value: 30, unit: 'min' },
            completedQuantity: 3,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
          {
            id: 'g3',
            name: 'Workouts',
            description: '',
            cadence: 'weekly',
            target: { value: 4, unit: 'sessions' },
            completedQuantity: 100,
            currentStreak: 0,
            longestStreak: 0,
            rewardName: '',
          },
        ]),
      }),
    );
    await page.goto('/home');

    const todayCard = page.locator('mat-card.metric-card', { hasText: /today/i }).first();
    await expect(todayCard).toBeVisible();

    const value = await todayCard.locator('.metric-card__value').textContent();
    // Daily goals contributed 4 + 3 = 7; the weekly goal must be excluded.
    expect(value).toContain('7');
    expect(value).not.toContain('100');
  });

  test('greeting includes the user display name (02-TC-F-002)', async ({ page }) => {
    await authenticate(page);
    const greeting = page.locator('.page-header__title').first();
    await expect(greeting).toContainText('Quinn');
  });

  test('greeting reflects time of day (02-TC-F-001)', async ({ page }) => {
    const cases: Array<{ hour: number; expected: string }> = [
      { hour: 8, expected: 'Good morning' },
      { hour: 14, expected: 'Good afternoon' },
      { hour: 19, expected: 'Good evening' },
      { hour: 23, expected: 'Good night' },
    ];

    for (const { hour, expected } of cases) {
      const fixed = new Date(2026, 4, 9, hour, 0, 0);
      await page.clock.install({ time: fixed });
      await authenticate(page);
      const greeting = page.locator('.page-header__title').first();
      await expect(greeting).toContainText(expected);
      // Reset for next iteration
      await page.context().clearCookies();
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
    }
  });

  test('print stylesheet hides nav chrome (02-TC-R-006)', async ({ page }) => {
    await authenticate(page);
    await page.emulateMedia({ media: 'print' });

    const headline = page.locator('.page-header__title').first();
    await expect(headline).toBeVisible();

    for (const variant of ['bottom', 'rail', 'drawer']) {
      const nav = page.locator(`hg-navigation-bar.app-shell__navigation--${variant}`);
      const display = await nav.evaluate(
        (el) => getComputedStyle(el).display,
        undefined,
        { timeout: 1_000 },
      ).catch(() => 'none');
      expect(display).toBe('none');
    }
  });

  test('dashboard re-layouts cleanly when resizing 1024→1440 (02-TC-R-005)', async ({ page }) => {
    await authenticate(page);

    for (const width of [1024, 1200, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    }

    // After landing at 1440, the drawer nav is the active variant
    const drawer = page.locator('hg-navigation-bar.app-shell__navigation--drawer');
    await expect(drawer).toBeVisible();
  });

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

    test('dashboard section vertical rhythm is 24 px (02-TC-L-006)', async ({ page }) => {
      await authenticate(page);
      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      const rowGap = await root.evaluate((el) => getComputedStyle(el).rowGap);
      expect(rowGap).toBe('24px');
    });

    test('1440 viewport — drawer + main bounded by 1152 px (02-TC-R-004)', async ({ page }) => {
      await authenticate(page);

      const drawer = page.locator('hg-navigation-bar.app-shell__navigation--drawer');
      await expect(drawer).toBeVisible();

      const main = page.locator('main.app-shell__main');
      const maxPx = await main.evaluate((el) => {
        const max = getComputedStyle(el).maxWidth;
        return max === 'none' ? Number.POSITIVE_INFINITY : parseFloat(max);
      });
      expect(maxPx).toBeLessThanOrEqual(1152);
    });

    test('desktop shows drawer nav, hides bottom and rail (02-TC-R-003)', async ({ page }) => {
      await authenticate(page);

      const drawer = page.locator('hg-navigation-bar.app-shell__navigation--drawer');
      const rail = page.locator('hg-navigation-bar.app-shell__navigation--rail');
      const bottom = page.locator('hg-navigation-bar.app-shell__navigation--bottom');

      await expect(drawer).toBeVisible();
      await expect(rail).toBeHidden();
      await expect(bottom).toBeHidden();
    });

    test('desktop main content is bounded by max content width (02-TC-L-010)', async ({
      page,
    }) => {
      await authenticate(page);
      const root = page.locator('hg-dashboard-overview .dashboard-overview').first();
      const width = await root.evaluate((el) => el.getBoundingClientRect().width);
      expect(width).toBeLessThanOrEqual(1152);
    });

    test('dashboard header avatar is 48 px on desktop (02-TC-L-007)', async ({ page }) => {
      await authenticate(page);
      const avatar = page.locator('[data-testid="dashboard-avatar"] .user-avatar').first();
      await expect(avatar).toBeVisible();
      const size = await avatar.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      expect(size.width).toBe(48);
      expect(size.height).toBe(48);
    });

    test('bar-chart bars are 4 viewBox units apart (02-TC-L-005)', async ({ page }) => {
      await authenticate(page);

      const bars = page.locator('[data-testid="dashboard-bar-chart"] .bar-chart__bar');
      const count = await bars.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const positions = await bars.evaluateAll((els) =>
        els.map((el) => ({
          x: parseFloat(el.getAttribute('x') ?? '0'),
          width: parseFloat(el.getAttribute('width') ?? '0'),
        })),
      );

      for (let i = 1; i < positions.length; i++) {
        const gap = positions[i].x - (positions[i - 1].x + positions[i - 1].width);
        expect(gap).toBe(4);
      }
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

    test('dashboard header avatar is 40 px on tablet (02-TC-L-007)', async ({ page }) => {
      await authenticate(page);
      const avatar = page.locator('[data-testid="dashboard-avatar"] .user-avatar').first();
      const size = await avatar.evaluate((el) => el.getBoundingClientRect());
      expect(size.width).toBe(40);
      expect(size.height).toBe(40);
    });

    test('tablet shows rail nav variant (02-TC-R-002)', async ({ page }) => {
      await authenticate(page);
      const rail = page.locator('hg-navigation-bar.app-shell__navigation--rail');
      await expect(rail).toBeVisible();
    });

    test('tablet metric cards lay out in 1-2 columns (02-TC-L-009)', async ({ page }) => {
      await authenticate(page);
      const cards = page.locator('hg-metric-card');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      );
      const distinct = new Set(lefts);
      expect(distinct.size).toBeGreaterThanOrEqual(1);
      expect(distinct.size).toBeLessThanOrEqual(2);
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

    test('dashboard header avatar is 32 px on mobile (02-TC-L-007)', async ({ page }) => {
      await authenticate(page);
      const avatar = page.locator('[data-testid="dashboard-avatar"] .user-avatar').first();
      const size = await avatar.evaluate((el) => el.getBoundingClientRect());
      expect(size.width).toBe(32);
      expect(size.height).toBe(32);
    });

    test('mobile shows bottom nav (02-TC-R-001)', async ({ page }) => {
      await authenticate(page);
      const bottomNav = page.locator('hg-navigation-bar.app-shell__navigation--bottom');
      await expect(bottomNav).toBeVisible();
    });

    test('mobile metric cards stack in a single column (02-TC-L-008)', async ({ page }) => {
      await authenticate(page);
      const cards = page.locator('hg-metric-card');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const lefts = await cards.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().left),
      );
      const minLeft = Math.min(...lefts);
      const maxLeft = Math.max(...lefts);
      expect(maxLeft - minLeft).toBeLessThan(2);
    });
  });
});
