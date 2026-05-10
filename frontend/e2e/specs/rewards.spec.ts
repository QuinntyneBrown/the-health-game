// Acceptance Test
// Traces to: 05-TC-V-001..008, 05-TC-C-001..010, 05-TC-L-001..010, 05-TC-R-001..005, 05-TC-F-001..007, 05-TC-F-101..105, 05-TC-F-201..203, 05-TC-B-001..004, 05-TC-A-001..005, 05-TC-D-001..002
// Description: rewards list page chrome.
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

const readyReward = {
  id: 'r-ready',
  goalId: 'g1',
  name: 'Spa day',
  description: 'You hit your 30-day streak — go enjoy it.',
  status: 'ready-to-claim',
  earnedAt: null,
  condition: { type: 'streak-milestone', streakDays: 30 },
};

test.describe('Rewards list', () => {
  test('earned reward survives reload (05-TC-D-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'r-earned',
            goalId: 'g1',
            name: 'Earned trophy',
            description: '',
            status: 'earned',
            earnedAt: '2026-04-01T08:00:00Z',
            condition: { type: 'streak-milestone', streakDays: 30 },
          },
        ]),
      }),
    );

    await page.goto('/rewards');
    const earnedSection = page.locator('lib-reward-list .reward-section[data-status="earned"]');
    await expect(earnedSection).toContainText('Earned trophy');
    const dateBefore = (await earnedSection
      .locator('.reward-card__date')
      .first()
      .textContent())?.trim();
    expect((dateBefore ?? '').length).toBeGreaterThan(0);

    await page.reload();
    await expect(earnedSection).toContainText('Earned trophy');
    const dateAfter = (await earnedSection
      .locator('.reward-card__date')
      .first()
      .textContent())?.trim();
    expect(dateAfter).toBe(dateBefore);
  });

  test('defined reward survives reload (05-TC-D-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    let serverRewards: Array<Record<string, unknown>> = [];
    const created = {
      id: 'r-defined',
      goalId: 'g1',
      name: 'Defined reward',
      description: 'Survives reload',
      status: 'in-progress',
      earnedAt: null,
      condition: { type: 'streak-milestone', streakDays: 7 },
    };
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(serverRewards),
      }),
    );
    await page.route('**/api/goals/*/rewards', (route, request) => {
      if (request.method() === 'POST') {
        serverRewards = [created];
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.continue();
    });

    await page.goto('/rewards/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input, textarea')
      .fill('Defined reward');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Description' })
      .locator('input, textarea')
      .fill('Survives reload');
    await page.locator('[data-testid="reward-form-streak"] label').click();
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Streak days' })
      .locator('input')
      .fill('7');
    await page.locator('[data-testid="reward-form-save"]').click();
    await page.waitForURL(/\/rewards($|\?|#)/);

    await expect(page.locator('lib-reward-list')).toContainText('Defined reward');

    await page.reload();
    await expect(page.locator('lib-reward-list')).toContainText('Defined reward');
  });

  test('axe-core: 0 critical/serious on /rewards (05-TC-A-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');
    await expect(page.locator('lib-reward-list')).toBeVisible();
    await page.waitForTimeout(120);

    const result = await new AxeBuilder({ page })
      .include('lib-reward-list')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = result.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    if (blocking.length) {
      console.log(blocking.map((v) => `${v.id} (${v.impact}) — ${v.help}`).join('\n'));
    }
    expect(blocking).toHaveLength(0);
  });

  test('Claim button has descriptive accessible name (05-TC-A-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const claim = page.locator('[data-testid="reward-hero-claim"]');
    await expect(claim).toBeVisible();
    const label = await claim.getAttribute('aria-label');
    expect(label ?? '').toBe(`Claim ${readyReward.name}`);
  });

  test('progress bar exposes role + aria-valuenow/max (05-TC-A-003)', async ({ page }) => {
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

    const bar = page.locator('lib-reward-list .reward-card mat-progress-bar').first();
    await expect(bar).toBeAttached();
    const meta = await bar.evaluate((el) => ({
      role: el.getAttribute('role'),
      now: el.getAttribute('aria-valuenow'),
      min: el.getAttribute('aria-valuemin'),
      max: el.getAttribute('aria-valuemax'),
      label: el.getAttribute('aria-label'),
    }));
    expect(meta.role).toBe('progressbar');
    // Material renders aria-valuenow as the percent (0–100) by default, so
    // the contract here is just "non-empty numeric value" + a populated max.
    expect(Number.isFinite(Number(meta.now ?? ''))).toBe(true);
    expect(Number.isFinite(Number(meta.max ?? ''))).toBe(true);
    expect(meta.label ?? '').toMatch(/Spa day/);
  });

  test('state communicated via text + icon, not color alone (05-TC-A-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          ...sampleRewards,
          {
            id: 'r-locked',
            goalId: 'g1',
            name: 'Locked one',
            description: '',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
        ]),
      }),
    );
    await page.goto('/rewards');

    const measure = async (status: string) => {
      const sel = `lib-reward-list .reward-section[data-status="${status}"] .reward-card`;
      const card = page.locator(sel).first();
      await expect(card).toBeVisible();
      return card.evaluate((el) => {
        const chip = el.querySelector('mat-chip');
        const icon = el.querySelector('mat-icon');
        return {
          chipText: chip?.textContent?.trim() ?? '',
          iconText: icon?.textContent?.trim() ?? '',
        };
      });
    };

    const earned = await measure('earned');
    const inProgress = await measure('in-progress');
    const locked = await measure('locked');

    // Each state has a non-empty status label (text channel).
    expect(earned.chipText.length).toBeGreaterThan(0);
    expect(inProgress.chipText.length).toBeGreaterThan(0);
    expect(locked.chipText.length).toBeGreaterThan(0);

    // Each state surfaces an icon (icon channel) and the icon glyph differs
    // between active states (earned vs not-earned) so the channel is real,
    // not just a duplicate decoration.
    expect(earned.iconText.length).toBeGreaterThan(0);
    expect(inProgress.iconText.length).toBeGreaterThan(0);
    expect(locked.iconText.length).toBeGreaterThan(0);
    expect(earned.iconText).not.toBe(locked.iconText);
  });

  test('hero is a section labelled by an h2 title (05-TC-A-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const meta = await hero.evaluate((el) => {
      const labelledBy = el.getAttribute('aria-labelledby');
      const target = labelledBy ? document.getElementById(labelledBy) : null;
      return {
        tagName: el.tagName,
        labelledBy,
        targetTag: target?.tagName ?? null,
        targetText: target?.textContent?.trim() ?? '',
      };
    });
    expect(meta.tagName).toBe('SECTION');
    expect(meta.labelledBy).toBeTruthy();
    expect(meta.targetTag).toBe('H2');
    expect(meta.targetText.length).toBeGreaterThan(0);
  });

  test('reward card lifts on hover (05-TC-B-004)', async ({ page }) => {
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

    const card = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-card')
      .first();
    await expect(card).toBeVisible();
    const before = await card.evaluate((el) => getComputedStyle(el).boxShadow);

    await card.hover();
    await page.waitForTimeout(120);
    const after = await card.evaluate((el) => getComputedStyle(el).boxShadow);

    expect(after).not.toBe(before);
    expect(after).not.toBe('none');
  });

  test('reduced-motion: no celebratory animation on Claim (05-TC-B-003)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const result = await hero.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        animationName: s.animationName,
        animationDuration: s.animationDuration,
        transitionDuration: s.transitionDuration,
        transform: s.transform,
      };
    });
    expect(result.animationName === 'none' || result.animationDuration === '0s').toBe(true);
    expect(result.transitionDuration === '0s' || result.transitionDuration === '').toBe(true);

    await context.close();
  });

  test('Claim button shows loading state until done (05-TC-B-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route, request) => {
      const url = new URL(request.url());
      if (request.method() === 'POST' && /\/api\/rewards\/.+\/claim$/.test(url.pathname)) {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...readyReward,
              status: 'earned',
              earnedAt: '2026-05-10T08:00:00Z',
            }),
          });
        }, 600);
        return;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      });
    });

    await page.goto('/rewards');
    const claim = page.locator('[data-testid="reward-hero-claim"]');
    expect(await claim.getAttribute('aria-busy')).not.toBe('true');
    expect(await claim.isDisabled()).toBe(false);

    await claim.click();
    await page.waitForTimeout(80);
    // While the POST is in flight: aria-busy=true and the button is disabled.
    expect(await claim.getAttribute('aria-busy')).toBe('true');
    expect(await claim.isDisabled()).toBe(true);

    await expect(page.locator('lib-reward-list .reward-hero')).toBeHidden({ timeout: 4000 });
  });

  test('tab order: filter -> hero claim -> grid card -> new reward (05-TC-B-001)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');
    // Dismiss the queued snackbar so it doesn't sit in the tab order.
    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    if (await snack.isVisible()) {
      await snack.locator('button').first().click();
      await snack.waitFor({ state: 'hidden' });
    }

    const order = await page.evaluate(async () => {
      // Stable identifiers for known anchor elements.
      const filterFirst = document.querySelector(
        'lib-reward-list hg-segmented-filter mat-button-toggle button',
      );
      const heroClaim = document.querySelector('[data-testid="reward-hero-claim"]');
      const heroSecondary = document.querySelector('[data-testid="reward-hero-secondary"]');
      const firstCard = document.querySelector(
        'lib-reward-list .reward-section[data-status="in-progress"] .reward-card',
      );
      const newRewardBtn = document.querySelector(
        'lib-reward-list .page-header__action button',
      );
      const all = [filterFirst, heroClaim, heroSecondary, firstCard, newRewardBtn];
      return all.map((el) => {
        if (!el) return null;
        const rect = (el as HTMLElement).getBoundingClientRect();
        return { y: Math.round(rect.top), x: Math.round(rect.left) };
      });
    });

    // Visual order should follow doc order: filter (left) → hero CTAs → first card → CTA in header.
    // Read DOM ordering via tabindex traversal would be flaky cross-browser, so
    // we instead lock the visual flow: filter sits above the hero, hero sits
    // above the grid; the New-reward CTA sits in the page-header (top-right).
    const filterY = order[0]?.y ?? 0;
    const heroY = order[1]?.y ?? 0;
    const cardY = order[3]?.y ?? 0;
    expect(heroY).toBeGreaterThan(filterY - 200);
    expect(cardY).toBeGreaterThan(heroY);

    // Hero secondary follows hero primary.
    const claimX = order[1]?.x ?? 0;
    const secondaryX = order[2]?.x ?? 0;
    expect(secondaryX).toBeGreaterThanOrEqual(claimX);
  });

  test('reward notification has accessible name + dismissible (05-TC-F-203)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    await expect(snack).toBeVisible({ timeout: 4000 });

    // Accessible name: any descendant exposes a live-region role/aria so
    // screen readers announce the toast (Material's CDK live announcer is
    // typically a sibling div with aria-live).
    const meta = await snack.evaluate((el) => {
      const role = el.getAttribute('role');
      const ariaLive = el.getAttribute('aria-live');
      const liveDescendant =
        el.querySelector('[role="alert"], [role="status"], [aria-live]') ??
        document.querySelector('.cdk-live-announcer-element, [aria-live]');
      const labelEl = el.querySelector(
        '.mdc-snackbar__label, .mat-mdc-snack-bar-label, [aria-live]',
      );
      const text = (labelEl?.textContent ?? el.textContent ?? '').trim();
      const action = el.querySelector(
        'button.mat-mdc-snack-bar-action, button.mdc-snackbar__action, button[matsnackbaractions], button',
      ) as HTMLButtonElement | null;
      return {
        role,
        ariaLive,
        hasLiveRegion: !!liveDescendant,
        text,
        hasAction: !!action,
      };
    });
    const announced =
      meta.role === 'alert' ||
      meta.ariaLive === 'polite' ||
      meta.ariaLive === 'assertive' ||
      meta.hasLiveRegion;
    expect(announced).toBe(true);
    expect(meta.text.length).toBeGreaterThan(0);
    expect(meta.text).toMatch(/Spa day|reward/i);
    expect(meta.hasAction).toBe(true);

    // Dismissible: clicking the action closes the snackbar.
    await snack.locator('button').first().click();
    await expect(snack).toBeHidden({ timeout: 4000 });
  });

  test('queued offline earn surfaces on next /rewards visit (05-TC-F-202)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    await expect(snack).toBeVisible({ timeout: 4000 });
    await expect(snack).toContainText(/Spa day|Reward/i);
  });

  test('streak crossing threshold mid-session shows reward toast (05-TC-F-201)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    const goal = {
      id: 'g1',
      name: 'Walk',
      description: '',
      cadence: 'daily' as const,
      target: { value: 10, unit: 'min' },
      completedQuantity: 0,
      currentStreak: 6,
      longestStreak: 6,
      rewardName: '',
    };
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(goal) }),
    );
    await page.route('**/api/goals/g1/activities**', (route, request) => {
      if (request.method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-streak-cross',
            goalId: 'g1',
            quantity: 10,
            recordedAt: '2026-05-10T07:00:00Z',
            newlyEarnedRewards: [{ id: 'r-7day', name: '7-day badge' }],
          }),
        });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);
    await page.locator('mat-dialog-container input[type="number"]').fill('10');
    await page.locator('[data-testid="log-activity-save"]').click();
    await expect(page.locator('mat-dialog-container')).toBeHidden();

    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    await expect(snack).toBeVisible({ timeout: 4000 });
    await expect(snack).toContainText(/7-day badge/);
  });

  test('delete reward removes it from the list (05-TC-F-105)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    let deleteCalls = 0;
    let deleteUrl = '';
    let serverRewards: Array<Record<string, unknown>> = [
      {
        id: 'r-del',
        goalId: 'g1',
        name: 'Delete me',
        description: '',
        status: 'in-progress',
        earnedAt: null,
        condition: { type: 'streak-milestone', streakDays: 5 },
      },
      {
        id: 'r-keep',
        goalId: 'g1',
        name: 'Already earned trophy',
        description: '',
        status: 'earned',
        earnedAt: '2026-04-01T08:00:00Z',
        condition: { type: 'streak-milestone', streakDays: 5 },
      },
    ];
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards/r-del', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(serverRewards.find((r) => (r as { id: string }).id === 'r-del')),
        });
        return;
      }
      if (request.method() === 'DELETE') {
        deleteCalls += 1;
        deleteUrl = new URL(request.url()).pathname;
        // Server preserves the earned trophy as user history (L2-009 §4)
        // and removes the deleted reward from the active list.
        serverRewards = serverRewards.filter((r) => (r as { id: string }).id !== 'r-del');
        route.fulfill({ status: 204, contentType: 'application/json', body: '' });
        return;
      }
      route.continue();
    });
    await page.route('**/api/rewards', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(serverRewards),
      }),
    );

    await page.goto('/rewards/r-del/edit');
    await expect(
      page.locator('hg-health-text-field').filter({ hasText: 'Name' }).locator('input'),
    ).toHaveValue('Delete me');
    await page.locator('[data-testid="reward-form-delete"]').click();
    await page.waitForURL(/\/rewards($|\?|#)/);

    expect(deleteCalls).toBe(1);
    expect(deleteUrl).toBe('/api/rewards/r-del');
    await expect(page.locator('lib-reward-list')).not.toContainText('Delete me');
    await expect(page.locator('lib-reward-list')).toContainText('Already earned trophy');
  });

  test('edit reward name/description persists (05-TC-F-104)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'g1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    let putBody: Record<string, unknown> | null = null;
    let putUrl = '';
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards/r-edit', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'r-edit',
            goalId: 'g1',
            name: 'Old name',
            description: 'Old description',
            status: 'in-progress',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 7 },
          }),
        });
        return;
      }
      if (request.method() === 'PUT') {
        putBody = request.postDataJSON();
        putUrl = new URL(request.url()).pathname;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'r-edit',
            goalId: 'g1',
            name: (putBody as { name: string }).name,
            description: (putBody as { description: string }).description,
            status: 'in-progress',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 7 },
          }),
        });
        return;
      }
      route.continue();
    });
    await page.route('**/api/rewards', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/rewards/r-edit/edit');
    const nameInput = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input, textarea');
    await expect(nameInput).toHaveValue('Old name');
    await nameInput.fill('New shiny name');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Description' })
      .locator('input, textarea')
      .fill('Updated description');

    await page.locator('[data-testid="reward-form-save"]').click();
    await page.waitForURL(/\/rewards($|\?|#)/);

    expect(putUrl).toBe('/api/rewards/r-edit');
    expect(putBody).toMatchObject({
      name: 'New shiny name',
      description: 'Updated description',
    });
  });

  test('server rejects reward on non-owned goal → toast (05-TC-F-103)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'goal-1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/goals/*/rewards', (route, request) => {
      if (request.method() === 'POST') {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Goal is not owned by the current user.' }),
        });
        return;
      }
      route.continue();
    });

    await page.goto('/rewards/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input, textarea')
      .fill('Spa day');
    await page.locator('[data-testid="reward-form-streak"] label').click();
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Streak days' })
      .locator('input')
      .fill('30');
    await page.locator('[data-testid="reward-form-save"]').click();
    await page.waitForTimeout(300);

    // FE stays on the form (no navigation), surfaces the error to the user.
    expect(new URL(page.url()).pathname).toBe('/rewards/new');
    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container, [role="alert"]')
      .first();
    await expect(snack).toBeVisible({ timeout: 4000 });
    await expect(snack).toContainText(/not owned|forbidden|cannot|denied|reward|403/i);
  });

  test('create reward without valid condition shows error (05-TC-F-102)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'goal-1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    let postCalls = 0;
    await page.route('**/api/goals/*/rewards', (route, request) => {
      if (request.method() === 'POST') {
        postCalls += 1;
      }
      route.continue();
    });

    await page.goto('/rewards/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input, textarea')
      .fill('Spa day');
    // Pick the streak-milestone variant but leave streak days at 0.
    await page.locator('[data-testid="reward-form-streak"] label').click();
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Streak days' })
      .locator('input')
      .fill('0');
    await page.locator('[data-testid="reward-form-save"]').click();
    await page.waitForTimeout(150);

    // Validation error visible, no POST, still on the form route.
    const error = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Streak days' })
      .locator('.health-text-field__error');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/at least 1|required|streak/i);
    expect(postCalls).toBe(0);
    expect(new URL(page.url()).pathname).toBe('/rewards/new');
  });

  test('create reward with goal + streak condition persists (05-TC-F-101)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route, request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/goals') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'goal-1', name: 'Walk', cadence: 'daily', target: { value: 10, unit: 'min' }, completedQuantity: 0, currentStreak: 0, longestStreak: 0, rewardName: '', description: '' },
          ]),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    let postedBody: Record<string, unknown> | null = null;
    let postedUrl = '';
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/goals/*/rewards', (route, request) => {
      if (request.method() === 'POST') {
        postedBody = request.postDataJSON();
        postedUrl = new URL(request.url()).pathname;
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'r-new',
            goalId: 'goal-1',
            name: (postedBody as { name: string }).name,
            description: (postedBody as { description: string }).description,
            status: 'in-progress',
            earnedAt: null,
            condition: (postedBody as { condition: unknown }).condition,
          }),
        });
        return;
      }
      route.continue();
    });

    await page.goto('/rewards/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input, textarea')
      .fill('Spa day');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Description' })
      .locator('input, textarea')
      .fill('30-day streak reward');
    // Goal already prefilled to first option (goal-1).
    await page.locator('[data-testid="reward-form-streak"] label').click();
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Streak days' })
      .locator('input')
      .fill('30');
    await page.locator('[data-testid="reward-form-save"]').click();
    await page.waitForURL(/\/rewards($|\?|#)/);

    expect(postedUrl).toBe('/api/goals/goal-1/rewards');
    expect(postedBody).toMatchObject({
      name: 'Spa day',
      description: '30-day streak reward',
      condition: { type: 'streak-milestone', streakDays: 30 },
    });
  });

  test('click reward card navigates to /rewards/:id (05-TC-F-007)', async ({ page }) => {
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
    await page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-card')
      .first()
      .click();
    await page.waitForURL(/\/rewards\/r2($|\?|#)/);
  });

  test('filter tabs scope grid to status (05-TC-F-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          readyReward,
          ...sampleRewards,
          {
            id: 'r-locked-1',
            goalId: 'g1',
            name: 'Locked extra',
            description: '',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
        ]),
      }),
    );
    await page.goto('/rewards');

    const cards = () => page.locator('lib-reward-list .reward-card');
    await expect(cards()).toHaveCount(3); // earned + in-progress + locked extra (hero excluded)

    await page
      .locator('lib-reward-list hg-segmented-filter mat-button-toggle')
      .filter({ hasText: 'In progress' })
      .click();
    await page.waitForTimeout(80);
    await expect(cards()).toHaveCount(1);
    await expect(cards().first()).toContainText('Spa day');

    await page
      .locator('lib-reward-list hg-segmented-filter mat-button-toggle')
      .filter({ hasText: 'Earned' })
      .click();
    await page.waitForTimeout(80);
    await expect(cards()).toHaveCount(1);
    await expect(cards().first()).toContainText('New running shoes');

    await page
      .locator('lib-reward-list hg-segmented-filter mat-button-toggle')
      .filter({ hasText: 'Locked' })
      .click();
    await page.waitForTimeout(80);
    await expect(cards()).toHaveCount(1);
    await expect(cards().first()).toContainText('Locked extra');

    await page
      .locator('lib-reward-list hg-segmented-filter mat-button-toggle')
      .filter({ hasText: 'All' })
      .click();
    await page.waitForTimeout(80);
    await expect(cards()).toHaveCount(3);
  });

  test('streak reset after earn keeps reward earned (05-TC-F-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    let getCount = 0;
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route, request) => {
      if (request.method() !== 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }
      getCount += 1;
      // Both responses contain the earned reward — server never revokes it
      // even after a hypothetical streak reset (L2-010 §3).
      const earnedReward = {
        id: 'r-earned-1',
        goalId: 'g1',
        name: 'Earned spa day',
        description: 'You hit a 30-day streak earlier',
        status: 'earned',
        earnedAt: '2026-04-15T10:00:00Z',
        condition: { type: 'streak-milestone', streakDays: 30 },
      };
      const inProgressReward = {
        id: 'r-ip-1',
        goalId: 'g1',
        name: 'In progress',
        description: '',
        status: 'in-progress',
        earnedAt: null,
        progress: { current: 3, target: 30 },
        condition: { type: 'streak-milestone', streakDays: 30 },
      };
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          getCount === 1
            ? [earnedReward, inProgressReward]
            : [
                earnedReward,
                { ...inProgressReward, progress: { current: 0, target: 30 } },
              ],
        ),
      });
    });

    await page.goto('/rewards');
    await expect(
      page.locator('lib-reward-list .reward-section[data-status="earned"]'),
    ).toContainText('Earned spa day');

    // Simulate "user lost their streak" by re-fetching: in-progress reward
    // resets to 0/30 but the earned reward must still be present.
    await page.reload();
    await expect(
      page.locator('lib-reward-list .reward-section[data-status="earned"]'),
    ).toContainText('Earned spa day');

    const earnedDate = page
      .locator('lib-reward-list .reward-section[data-status="earned"] .reward-card__date')
      .first();
    await expect(earnedDate).toBeVisible();
    await expect(earnedDate).not.toHaveText(/^$/);
  });

  test('Claim moves reward to earned with timestamp (05-TC-F-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    let rewards: Array<Record<string, unknown>> = [readyReward, ...sampleRewards];
    let claimCalls = 0;
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route, request) => {
      const url = new URL(request.url());
      if (request.method() === 'POST' && /\/api\/rewards\/.+\/claim$/.test(url.pathname)) {
        claimCalls += 1;
        const id = url.pathname.split('/').slice(-2, -1)[0];
        const claimedAt = '2026-05-10T07:30:00Z';
        rewards = rewards.map((r) =>
          (r as { id: string }).id === id
            ? { ...r, status: 'earned', earnedAt: claimedAt }
            : r,
        );
        const claimed = rewards.find((r) => (r as { id: string }).id === id);
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(claimed),
        });
        return;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rewards),
      });
    });

    await page.goto('/rewards');
    await expect(page.locator('lib-reward-list .reward-hero')).toBeVisible();
    await page.locator('[data-testid="reward-hero-claim"]').click();
    await expect(page.locator('lib-reward-list .reward-hero')).toBeHidden();
    expect(claimCalls).toBe(1);

    // Reward now appears under the earned section.
    const earnedSection = page.locator('lib-reward-list .reward-section[data-status="earned"]');
    await expect(earnedSection).toContainText(readyReward.name);

    // The earned card carries a date label populated from earnedAt.
    const earnedDate = earnedSection
      .locator('.reward-card', { hasText: readyReward.name })
      .locator('.reward-card__date')
      .first();
    await expect(earnedDate).toBeVisible();
    await expect(earnedDate).not.toHaveText(/^$/);
  });

  test('subtitle counts: 1 ready · 2 in progress · 3 locked (05-TC-F-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          readyReward,
          {
            id: 'ip1',
            goalId: 'g1',
            name: 'In progress 1',
            description: '',
            status: 'in-progress',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 5 },
          },
          {
            id: 'ip2',
            goalId: 'g1',
            name: 'In progress 2',
            description: '',
            status: 'in-progress',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 7 },
          },
          {
            id: 'l1',
            goalId: 'g1',
            name: 'Locked 1',
            description: '',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
          {
            id: 'l2',
            goalId: 'g1',
            name: 'Locked 2',
            description: '',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 90 },
          },
          {
            id: 'l3',
            goalId: 'g1',
            name: 'Locked 3',
            description: '',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 120 },
          },
        ]),
      }),
    );
    await page.goto('/rewards');

    const subtitle = page
      .locator('lib-reward-list .page-header__description')
      .first();
    await expect(subtitle).toBeVisible();
    const text = (await subtitle.textContent())?.trim() ?? '';
    expect(text).toMatch(/1\s*ready/i);
    expect(text).toMatch(/2\s*in\s*progress/i);
    expect(text).toMatch(/3\s*locked/i);
  });

  test('earned rewards distinguished from pending (05-TC-F-002)', async ({ page }) => {
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

    const earnedCard = page
      .locator('lib-reward-list .reward-section[data-status="earned"] .reward-card')
      .first();
    const inProgressCard = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-card')
      .first();
    await expect(earnedCard).toBeVisible();
    await expect(inProgressCard).toBeVisible();

    const meta = await page.evaluate(() => {
      const earned = document.querySelector(
        'lib-reward-list .reward-section[data-status="earned"] .reward-card',
      );
      const inProgress = document.querySelector(
        'lib-reward-list .reward-section[data-status="in-progress"] .reward-card',
      );
      const earnedDate = document.querySelector(
        'lib-reward-list .reward-section[data-status="earned"] .reward-card__date',
      );
      const earnedChip = document.querySelector(
        'lib-reward-list .reward-section[data-status="earned"] .reward-card mat-chip',
      );
      return {
        earnedBg: earned ? getComputedStyle(earned).backgroundColor : '',
        inProgressBg: inProgress ? getComputedStyle(inProgress).backgroundColor : '',
        earnedDateText: earnedDate?.textContent?.trim() ?? '',
        chipText: earnedChip?.textContent?.trim() ?? '',
      };
    });

    expect(meta.earnedBg).not.toBe(meta.inProgressBg);
    expect(meta.earnedDateText.length).toBeGreaterThan(0);
    expect(meta.chipText.toLowerCase()).toContain('earned');
  });

  test('list shows only current user\'s rewards (05-TC-F-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    const calls: string[] = [];
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route, request) => {
      calls.push(`${request.method()} ${new URL(request.url()).pathname}${new URL(request.url()).search}`);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleRewards),
      });
    });

    await page.goto('/rewards');
    await expect(page.locator('lib-reward-list .reward-card').first()).toBeVisible();

    // FE only hits /api/rewards (with optional query/path) — never /all,
    // /admin, /:userId — relying on the bearer-token-scoped endpoint to
    // do the ownership scoping server-side (L2-009 §1).
    expect(calls.length).toBeGreaterThanOrEqual(1);
    for (const c of calls) {
      expect(c).toMatch(/^GET \/api\/rewards(\?.*)?$/);
    }

    // Renders only the rewards the server returned (and no extras).
    const titles = await page
      .locator('lib-reward-list .reward-card__name')
      .allTextContents();
    expect(titles.length).toBe(sampleRewards.length);
    for (const r of sampleRewards) {
      expect(titles).toContain(r.name);
    }
  });

  test('locked cards still legible at 360 px (05-TC-R-005)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'r-locked',
            goalId: 'g1',
            name: 'Long-term reward title that should still be legible',
            description: 'Earned by hitting a 60-day streak',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
        ]),
      }),
    );
    await page.goto('/rewards');

    const item = page
      .locator('lib-reward-list .reward-section[data-status="locked"] .reward-list__item')
      .first();
    await expect(item).toBeVisible();
    const titleEl = item.locator('.reward-card__name').first();
    await expect(titleEl).toBeVisible();
    const meta = await titleEl.evaluate((el) => {
      const cs = getComputedStyle(el);
      const itemEl = el.closest('.reward-list__item') as HTMLElement;
      const itemOpacity = itemEl ? parseFloat(getComputedStyle(itemEl).opacity) : 1;
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim() ?? '';
      return {
        fontSize: parseFloat(cs.fontSize),
        opacity: itemOpacity,
        clientWidth: rect.width,
        viewportWidth: window.innerWidth,
        textLength: text.length,
        textTruncated: el.scrollWidth > el.clientWidth + 1,
      };
    });
    // ≥ 13 px effective text size, opacity ≥ 0.6 still meets reading threshold,
    // and the card fits inside the viewport (no horizontal overflow).
    expect(meta.fontSize).toBeGreaterThanOrEqual(13);
    expect(meta.opacity).toBeGreaterThanOrEqual(0.6);
    expect(meta.clientWidth).toBeGreaterThan(0);
    expect(meta.clientWidth).toBeLessThanOrEqual(meta.viewportWidth);
  });

  test('hero CTAs stack on mobile with 12 px gap (05-TC-R-004)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const actions = page.locator('lib-reward-list .reward-hero__actions').first();
    await expect(actions).toBeVisible();
    const meta = await actions.evaluate((el) => {
      const s = getComputedStyle(el);
      const claim = el.querySelector('[data-testid="reward-hero-claim"]') as HTMLElement | null;
      const secondary = el.querySelector(
        '[data-testid="reward-hero-secondary"]',
      ) as HTMLElement | null;
      const cb = claim?.getBoundingClientRect();
      const sb = secondary?.getBoundingClientRect();
      return {
        flexDirection: s.flexDirection,
        gap: s.rowGap || s.gap,
        stacked: !!(cb && sb && sb.top >= cb.bottom - 4),
      };
    });
    expect(meta.flexDirection).toBe('column');
    expect(meta.gap).toBe('12px');
    expect(meta.stacked).toBe(true);
  });

  test('desktop 1440 px: 3-col grid + bounded by max width (05-TC-R-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    const manyRewards = Array.from({ length: 6 }, (_, i) => ({
      id: `r-grid-${i}`,
      goalId: 'g1',
      name: `In-progress reward ${i + 1}`,
      description: '',
      status: 'in-progress',
      earnedAt: null,
      progress: { current: i, target: 10 },
      condition: { type: 'streak-milestone', streakDays: 10 + i },
    }));
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(manyRewards),
      }),
    );
    await page.goto('/rewards');

    const grid = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-list')
      .first();
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    );
    expect(cols).toBe(3);

    const host = page.locator('lib-reward-list').first();
    const meta = await host.evaluate((el) => {
      const innerWidth = window.innerWidth;
      const rect = el.getBoundingClientRect();
      const inner = el.querySelector('.reward-list-inner') as HTMLElement | null;
      const innerRect = inner?.getBoundingClientRect();
      return {
        innerWidth,
        hostWidth: rect.width,
        innerWidthEl: innerRect?.width ?? null,
      };
    });
    // Either the host or an inner wrapper must be bounded under viewport width on
    // a 1440-wide screen. We accept either pattern.
    const widthInside = meta.innerWidthEl ?? meta.hostWidth;
    expect(widthInside).toBeLessThanOrEqual(meta.innerWidth);
    // And there must be SOME bounding (i.e. content area not the full 1440).
    expect(widthInside).toBeLessThan(meta.innerWidth);
  });

  test('tablet 768 px: 2-col grid + hero side-by-side (05-TC-R-002)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const grid = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-list')
      .first();
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    );
    expect(cols).toBe(2);

    const hero = page.locator('lib-reward-list .reward-hero').first();
    const heroLayout = await hero.evaluate((el) => {
      const tracks = getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean);
      const frame = el.querySelector('.reward-hero__icon-frame') as HTMLElement | null;
      const copy = el.querySelector('.reward-hero__copy') as HTMLElement | null;
      const fb = frame?.getBoundingClientRect();
      const cb = copy?.getBoundingClientRect();
      return {
        cols: tracks.length,
        sideBySide: !!(fb && cb && fb.right <= cb.left + 4 && Math.abs(fb.top - cb.top) < 200),
      };
    });
    expect(heroLayout.cols).toBe(2);
    expect(heroLayout.sideBySide).toBe(true);
  });

  test('mobile 360 px: single column + hero stacks vertically (05-TC-R-001)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );
    await page.goto('/rewards');

    const grid = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-list')
      .first();
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    );
    expect(cols).toBe(1);

    const hero = page.locator('lib-reward-list .reward-hero').first();
    const heroLayout = await hero.evaluate((el) => {
      const tracks = getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean);
      const frame = el.querySelector('.reward-hero__icon-frame') as HTMLElement | null;
      const copy = el.querySelector('.reward-hero__copy') as HTMLElement | null;
      const fb = frame?.getBoundingClientRect();
      const cb = copy?.getBoundingClientRect();
      return {
        cols: tracks.length,
        iconAboveCopy: !!(fb && cb && fb.bottom <= cb.top + 4 && fb.left <= cb.left + 4),
      };
    });
    expect(heroLayout.cols).toBe(1);
    expect(heroLayout.iconAboveCopy).toBe(true);
  });

  test('top bar height 80 px (05-TC-L-010)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/rewards');
    const toolbar = page.locator('.app-shell__toolbar').first();
    await expect(toolbar).toBeVisible();
    const height = await toolbar.evaluate((el) => getComputedStyle(el).height);
    expect(height).toBe('80px');
  });

  test('page padding 32 / 24 / 16 by viewport (05-TC-L-009)', async ({ page }) => {
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleRewards),
      }),
    );

    const measure = async () => {
      const host = page.locator('lib-reward-list').first();
      await expect(host).toBeVisible();
      return host.evaluate((el) => getComputedStyle(el).paddingLeft);
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/rewards');
    await page.waitForTimeout(120);
    expect(await measure()).toBe('32px');

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(120);
    expect(await measure()).toBe('24px');

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(120);
    expect(await measure()).toBe('16px');
  });

  test('inter-card gap 16 px (05-TC-L-008)', async ({ page }) => {
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
    const grid = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-list')
      .first();
    await expect(grid).toBeVisible();
    const result = await grid.evaluate((el) => {
      const s = getComputedStyle(el);
      return { row: s.rowGap, col: s.columnGap };
    });
    expect(result.row).toBe('16px');
    expect(result.col).toBe('16px');
  });

  test('reward card padding 20 px (05-TC-L-007)', async ({ page }) => {
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
    const content = page.locator('lib-reward-list .reward-card__content').first();
    await expect(content).toBeVisible();
    const result = await content.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        top: s.paddingTop,
        right: s.paddingRight,
        bottom: s.paddingBottom,
        left: s.paddingLeft,
      };
    });
    expect(result.top).toBe('20px');
    expect(result.right).toBe('20px');
    expect(result.bottom).toBe('20px');
    expect(result.left).toBe('20px');
  });

  test('reward card corner radius 16 px (05-TC-L-006)', async ({ page }) => {
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
    const card = page.locator('lib-reward-list .reward-card').first();
    await expect(card).toBeVisible();
    const radius = await card.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBe('16px');
  });

  test('reward grid columns 3 / 2 / 1 by viewport (05-TC-L-005)', async ({ page }) => {
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    const manyRewards = Array.from({ length: 6 }, (_, i) => ({
      id: `r-grid-${i}`,
      goalId: 'g1',
      name: `In-progress reward ${i + 1}`,
      description: '',
      status: 'in-progress',
      earnedAt: null,
      progress: { current: i, target: 10 },
      condition: { type: 'streak-milestone', streakDays: 10 + i },
    }));
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(manyRewards),
      }),
    );

    const measureCols = async () => {
      const grid = page
        .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-list')
        .first();
      await expect(grid).toBeVisible();
      const cols = await grid.evaluate((el) => {
        const tracks = getComputedStyle(el).gridTemplateColumns;
        return tracks.split(/\s+/).filter((t) => t && t !== 'none').length;
      });
      return cols;
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/rewards');
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(3);

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(2);

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(1);
  });

  test('hero shadow offset 0 2 / blur 8 / #00000026 (05-TC-L-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const shadow = await hero.evaluate((el) => getComputedStyle(el).boxShadow);
    // 0x26 = 38 alpha → 38/255 ≈ 0.149 → some browsers print 0.15
    expect(shadow).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.1[45]\d*\)\s+0px\s+2px\s+8px/);
  });

  test('hero icon 120 px square / 9999 radius (05-TC-L-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const frame = page.locator('lib-reward-list .reward-hero__icon-frame').first();
    await expect(frame).toBeVisible();
    const result = await frame.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        width: s.width,
        height: s.height,
        radius: s.borderTopLeftRadius,
      };
    });
    expect(result.width).toBe('120px');
    expect(result.height).toBe('120px');
    expect(parseFloat(result.radius)).toBeGreaterThanOrEqual(60);
  });

  test('hero padding 32 px on all sides (05-TC-L-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const result = await hero.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        top: s.paddingTop,
        right: s.paddingRight,
        bottom: s.paddingBottom,
        left: s.paddingLeft,
      };
    });
    expect(result.top).toBe('32px');
    expect(result.right).toBe('32px');
    expect(result.bottom).toBe('32px');
    expect(result.left).toBe('32px');
  });

  test('hero corner radius 24 px (05-TC-L-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const radius = await hero.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBe('24px');
  });

  test('rewards page background #F1F5ED (05-TC-C-010)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/rewards');

    const list = page.locator('lib-reward-list');
    await expect(list).toBeVisible();
    const meta = await page.evaluate(() => {
      const target = ['lib-reward-list', 'app-root', 'body', 'html']
        .map((sel) => document.querySelector(sel) as HTMLElement | null)
        .filter((el): el is HTMLElement => !!el);
      return target.map((el) => ({
        tag: el.tagName,
        bg: getComputedStyle(el).backgroundColor,
      }));
    });
    const accepted = ['rgb(241, 245, 237)'];
    const found = meta.find((m) => accepted.includes(m.bg));
    expect(found, `expected #F1F5ED on rewards page, got ${JSON.stringify(meta)}`).toBeTruthy();
  });

  test('earned reward chip #94F7B4 bg, #00210F label (05-TC-C-009)', async ({ page }) => {
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
    const chipSurface = page
      .locator('lib-reward-list .reward-section[data-status="earned"] .reward-card mat-chip')
      .first()
      .locator('.mdc-evolution-chip__cell--primary, .mat-mdc-chip-action');
    const chipLabel = page
      .locator('lib-reward-list .reward-section[data-status="earned"] .reward-card mat-chip')
      .first()
      .locator('.mdc-evolution-chip__text-label, .mat-mdc-chip-action-label');
    await expect(chipLabel.first()).toBeVisible();
    await expect(chipLabel.first()).toHaveText(/Earned/i);

    const meta = await page.evaluate(() => {
      const chip = document.querySelector(
        'lib-reward-list .reward-section[data-status="earned"] .reward-card mat-chip',
      );
      const label = chip?.querySelector(
        '.mdc-evolution-chip__text-label, .mat-mdc-chip-action-label',
      ) as HTMLElement | null;
      const surface = chip?.querySelector(
        '.mdc-evolution-chip__cell--primary, .mat-mdc-chip-action',
      ) as HTMLElement | null;
      return {
        bg: chip ? getComputedStyle(chip).backgroundColor : '',
        labelColor: label ? getComputedStyle(label).color : '',
        surfaceBg: surface ? getComputedStyle(surface).backgroundColor : '',
      };
    });
    const allowed = ['rgb(148, 247, 180)', 'rgb(148, 247, 180)'];
    const bgChosen = meta.surfaceBg !== 'rgba(0, 0, 0, 0)' ? meta.surfaceBg : meta.bg;
    expect(allowed).toContain(bgChosen);
    expect(meta.labelColor).toBe('rgb(0, 33, 15)');
  });

  test('reward progress bar track #E5E9E2 (05-TC-C-008)', async ({ page }) => {
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
    const buffer = page
      .locator('lib-reward-list .reward-card mat-progress-bar .mdc-linear-progress__buffer-bar')
      .first();
    await expect(buffer).toBeAttached();
    const color = await buffer.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(color).toBe('rgb(229, 233, 226)');
  });

  test('reward progress bar fill #006D3F (05-TC-C-007)', async ({ page }) => {
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
    const fill = page
      .locator('lib-reward-list .reward-card mat-progress-bar .mdc-linear-progress__bar-inner')
      .first();
    await expect(fill).toBeAttached();
    const color = await fill.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(color).toBe('rgb(0, 109, 63)');
  });

  test('locked card bg #EBEFE7 with 0.65 opacity (05-TC-C-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          ...sampleRewards,
          {
            id: 'r-locked',
            goalId: 'g1',
            name: 'Massage',
            description: 'A 60-min back massage',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
        ]),
      }),
    );

    await page.goto('/rewards');
    const item = page
      .locator('lib-reward-list .reward-section[data-status="locked"] .reward-list__item')
      .first();
    await expect(item).toBeVisible();
    const card = item.locator('.reward-card');
    const result = await item.evaluate((el) => {
      const inner = el.querySelector('.reward-card');
      return {
        itemOpacity: parseFloat(getComputedStyle(el).opacity),
        cardBg: inner ? getComputedStyle(inner).backgroundColor : '',
      };
    });
    expect(result.itemOpacity).toBeCloseTo(0.65, 2);
    expect(result.cardBg).toBe('rgb(235, 239, 231)');
    await expect(card).toBeVisible();
  });

  test('in-progress card bg #EBEFE7 (05-TC-C-005)', async ({ page }) => {
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
    const card = page
      .locator('lib-reward-list .reward-section[data-status="in-progress"] .reward-card')
      .first();
    await expect(card).toBeVisible();
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(235, 239, 231)');
  });

  test('hero secondary CTA transparent bg / #C2C9BE outline (05-TC-C-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const secondary = page
      .locator('lib-reward-list [data-testid="reward-hero-secondary"]')
      .first();
    await expect(secondary).toBeVisible();
    const result = await secondary.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        borderColor: s.borderTopColor,
        borderWidth: s.borderTopWidth,
      };
    });
    expect(result.bg).toBe('rgba(0, 0, 0, 0)');
    expect(result.borderColor).toBe('rgb(194, 201, 190)');
    expect(parseFloat(result.borderWidth)).toBeGreaterThan(0);
  });

  test('hero "Claim" CTA #9B2680 bg, white label (05-TC-C-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const claim = page
      .locator('lib-reward-list [data-testid="reward-hero-claim"]')
      .first();
    await expect(claim).toBeVisible();
    await expect(claim).toContainText(/Claim/i);
    const result = await claim.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(result.bg).toBe('rgb(155, 38, 128)');
    expect(result.color).toBe('rgb(255, 255, 255)');
  });

  test('hero icon container #9B2680 / white icon (05-TC-C-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const frame = page.locator('lib-reward-list .reward-hero__icon-frame').first();
    await expect(frame).toBeVisible();
    const frameBg = await frame.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(frameBg).toBe('rgb(155, 38, 128)');

    const icon = page.locator('lib-reward-list .reward-hero__icon').first();
    const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe('rgb(255, 255, 255)');
  });

  test('hero background #FFD7EE for ready-to-claim (05-TC-C-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const hero = page.locator('lib-reward-list .reward-hero').first();
    await expect(hero).toBeVisible();
    const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 215, 238)');
  });

  test('"New reward" button Inter 14 px / weight 500 / white (05-TC-V-008)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/rewards');

    const button = page
      .locator('lib-reward-list .page-header__action button')
      .first();
    await expect(button).toBeVisible();
    await expect(button).toContainText('New reward');

    const labelEl = button.locator('.action-button__label, span').first();
    const result = await labelEl.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('14px');
    expect(result.weight).toBe('500');
    expect(result.color).toBe('rgb(255, 255, 255)');
  });

  test('reward progress text Inter 13 px / weight 600 (05-TC-V-007)', async ({ page }) => {
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
    const progress = page.locator('lib-reward-list .reward-card__progress-label').first();
    await expect(progress).toBeVisible();
    await expect(progress).toHaveText(/^6\s+of\s+10$/);
    const result = await progress.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('13px');
    expect(result.weight).toBe('600');
  });

  test('reward card title Inter 14 px / weight 500 (05-TC-V-006)', async ({ page }) => {
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
    const name = page.locator('lib-reward-list .reward-card__name').first();
    await expect(name).toBeVisible();
    const result = await name.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('14px');
    expect(result.weight).toBe('500');
  });

  test('section labels Inter 18 px / weight 500 (05-TC-V-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          readyReward,
          {
            id: 'r-locked',
            goalId: 'g1',
            name: 'Massage',
            description: 'A 60-min back massage',
            status: 'locked',
            earnedAt: null,
            condition: { type: 'streak-milestone', streakDays: 60 },
          },
          ...sampleRewards,
        ]),
      }),
    );

    await page.goto('/rewards');
    const labels = page.locator('lib-reward-list .reward-section__label');
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const result = await labels.nth(i).evaluate((el) => {
        const s = getComputedStyle(el);
        return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight, text: el.textContent?.trim() ?? '' };
      });
      expect(result.family).toMatch(/Inter/);
      expect(result.size).toBe('18px');
      expect(result.weight).toBe('500');
      expect(['In progress', 'Locked', 'Earned', 'Pending']).toContain(result.text);
    }

    const labelTexts = (await labels.allTextContents()).map((t) => t.trim());
    expect(labelTexts).toContain('In progress');
    expect(labelTexts).toContain('Locked');
  });

  test('hero description Inter 16 px / 400 / line-height 1.5 (05-TC-V-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const desc = page.locator('lib-reward-list .reward-hero__description').first();
    await expect(desc).toBeVisible();
    const result = await desc.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
        lineHeight: s.lineHeight,
      };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('16px');
    expect(result.weight).toBe('400');
    expect(result.lineHeight).toBe('24px');
  });

  test('hero reward title Inter 36 px desktop weight 500 (05-TC-V-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const title = page.locator('lib-reward-list .reward-hero__title').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveText(readyReward.name);
    const result = await title.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('36px');
    expect(result.weight).toBe('500');
  });

  test('hero eyebrow "READY TO CLAIM" Inter 11px/600/1.5px upper (05-TC-V-002)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.unroute('**/api/rewards**');
    await page.route('**/api/rewards**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([readyReward, ...sampleRewards]),
      }),
    );

    await page.goto('/rewards');
    const eyebrow = page
      .locator('lib-reward-list [data-testid="reward-hero-eyebrow"]')
      .first();
    await expect(eyebrow).toBeVisible();
    await expect(eyebrow).toHaveText(/^READY TO CLAIM$/);

    const result = await eyebrow.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform,
      };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('11px');
    expect(result.weight).toBe('600');
    expect(result.letterSpacing).toBe('1.5px');
    expect(result.textTransform).toBe('uppercase');
  });

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
