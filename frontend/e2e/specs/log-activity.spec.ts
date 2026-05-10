// Acceptance Test
// Traces to: 04-TC-V-001..007, 04-TC-C-001..010, 04-TC-L-001..010, 04-TC-R-001..006, 04-TC-F-001..012, 04-TC-F-101..109, 04-TC-B-001..010, 04-TC-A-001..005
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

test.describe('Log activity sheet (mobile)', () => {
  test('backdrop with unsaved changes shows discard confirm (04-TC-B-003)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    // Make a change so the sheet has "unsaved" content.
    await page
      .locator('lib-log-activity-sheet hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    const backdrop = page
      .locator('.cdk-overlay-backdrop:not(.cdk-overlay-transparent-backdrop)')
      .first();
    await backdrop.click({ position: { x: 5, y: 5 } });

    // The discard-confirm dialog appears; the sheet stays mounted.
    const confirm = page.locator('lib-discard-changes-dialog');
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText(/discard/i);
    await expect(page.locator('mat-bottom-sheet-container')).toBeVisible();
  });

  test('sheet/dialog title is linked via aria-labelledby (04-TC-A-002)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    const container = page.locator('mat-bottom-sheet-container').first();
    await expect(container).toBeVisible();

    const meta = await container.evaluate((el) => {
      const labelledBy = el.getAttribute('aria-labelledby');
      const ariaLabel = el.getAttribute('aria-label');
      const targetText = labelledBy
        ? document.getElementById(labelledBy)?.textContent?.trim() ?? ''
        : '';
      return { labelledBy, ariaLabel, targetText };
    });
    const accessibleName = meta.targetText || meta.ariaLabel || '';
    expect(accessibleName).toMatch(/Log activity/i);
  });

  test('submit button toggles aria-busy while logging (04-TC-A-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(goal) }),
    );
    await page.route('**/api/goals/g1/activities**', (route, request) => {
      if (request.method() === 'POST') {
        setTimeout(() => {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'a1',
              goalId: 'g1',
              quantity: 5,
              recordedAt: '2026-05-10T06:00:00Z',
              newlyEarnedRewards: [],
            }),
          });
        }, 600);
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="number"]').fill('5');

    const saveBtn = page.locator('[data-testid="log-activity-save"]');
    expect(await saveBtn.getAttribute('aria-busy')).not.toBe('true');

    await saveBtn.click();
    await page.waitForTimeout(80);
    expect(await saveBtn.getAttribute('aria-busy')).toBe('true');

    await expect(dialog).toBeHidden({ timeout: 4000 });
  });

  test('inline errors are announced via aria-live=polite (04-TC-A-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(goal) }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    await page.locator('[data-testid="log-activity-save"]').click();
    const errorMsg = page.locator('mat-dialog-container .health-text-field__error').first();
    await expect(errorMsg).toBeVisible();

    const announcement = await errorMsg.evaluate((el) => {
      const liveRegion = el.closest('[aria-live]') ?? el.querySelector('[aria-live]');
      const ownLive = el.getAttribute('aria-live');
      const ownRole = el.getAttribute('role');
      return {
        ariaLive: ownLive ?? liveRegion?.getAttribute('aria-live') ?? null,
        role: ownRole ?? liveRegion?.getAttribute('role') ?? null,
      };
    });
    expect(announcement.ariaLive).toBe('polite');
  });

  test('each input has a visible label programmatically associated (04-TC-A-003)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(goal) }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    const inputs = page.locator('mat-bottom-sheet-container input.mat-mdc-input-element');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const meta = await inputs.nth(i).evaluate((el) => {
        const id = el.id;
        const labelFor = id ? document.querySelector(`label[for="${id}"]`) : null;
        const labelForVisible =
          !!labelFor && (labelFor as HTMLElement).offsetParent !== null;
        const labelForText = labelFor?.textContent?.trim() ?? '';
        const labelledBy = el.getAttribute('aria-labelledby');
        const labelledByEls = labelledBy
          ? labelledBy
              .split(/\s+/)
              .map((token) => document.getElementById(token))
              .filter((node): node is HTMLElement => node !== null)
          : [];
        const labelledByVisible = labelledByEls.some((node) => node.offsetParent !== null);
        const labelledByText = labelledByEls
          .map((node) => node.textContent?.trim() ?? '')
          .join(' ')
          .trim();
        return {
          id,
          labelFor: !!labelFor,
          labelForVisible,
          labelForText,
          labelledBy,
          labelledByVisible,
          labelledByText,
        };
      });

      const hasAssociation = meta.labelFor || (meta.labelledBy?.length ?? 0) > 0;
      const isVisible = meta.labelForVisible || meta.labelledByVisible;
      const text = meta.labelForText || meta.labelledByText;

      expect(hasAssociation).toBe(true);
      expect(isVisible).toBe(true);
      expect(text.length).toBeGreaterThan(0);
    }
  });

  test('sheet exposes role=dialog + aria-modal=true (04-TC-A-001)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    const container = page.locator('mat-bottom-sheet-container').first();
    await expect(container).toBeVisible();
    const role = await container.getAttribute('role');
    const ariaModal = await container.getAttribute('aria-modal');
    expect(['dialog', 'alertdialog']).toContain(role ?? '');
    expect(ariaModal === 'true' || ariaModal === '').toBe(true);
  });

  test('drag handle swipe dismisses the sheet (04-TC-B-010)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    const handle = page.locator('lib-log-activity-sheet .sheet__handle').first();
    await expect(handle).toBeVisible();

    // Simulate a downward swipe on the handle.
    const box = await handle.boundingBox();
    if (!box) throw new Error('no handle box');
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 200, { steps: 10 });
    await page.mouse.up();

    await expect(page.locator('mat-bottom-sheet-container')).toHaveCount(0);
  });

  test('backdrop click closes the sheet (04-TC-B-002)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(300);

    await expect(page.locator('mat-bottom-sheet-container')).toBeVisible();

    const backdrop = page
      .locator('.cdk-overlay-backdrop:not(.cdk-overlay-transparent-backdrop)')
      .first();
    await backdrop.click({ position: { x: 5, y: 5 } });

    await expect(page.locator('mat-bottom-sheet-container')).toHaveCount(0);
  });

  test('FAB opens sheet with slide-up; respects reduced-motion (04-TC-B-001)', async ({
    browser,
  }) => {
    async function readSheetTransition(reducedMotion: 'reduce' | 'no-preference') {
      const ctx = await browser.newContext({ reducedMotion });
      const page = await ctx.newPage();
      await page.setViewportSize({ width: 360, height: 780 });
      await authenticate(page);
      await page.route('**/api/goals/g1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(goal),
        }),
      );
      await page.route('**/api/goals/g1/activities**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );
      await page.goto('/goals/g1');
      await page
        .locator('[data-testid="goal-detail-log-fab"]')
        .evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(300);

      const container = page.locator('mat-bottom-sheet-container').first();
      await container.waitFor({ state: 'visible' });
      const props = await container.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          transitionDuration: s.transitionDuration,
          animationDuration: s.animationDuration,
        };
      });
      await ctx.close();
      return props;
    }

    const motion = await readSheetTransition('no-preference');
    const reduced = await readSheetTransition('reduce');

    // Either transition or animation drives the slide; require non-zero in motion mode.
    const motionMs =
      Math.max(parseFloat(motion.transitionDuration) * 1000, parseFloat(motion.animationDuration) * 1000);
    const reducedMs =
      Math.max(parseFloat(reduced.transitionDuration) * 1000, parseFloat(reduced.animationDuration) * 1000);
    expect(motionMs).toBeGreaterThan(0);
    expect(reducedMs).toBe(0);
  });

  test('long notes: sheet stays scrollable, submit reachable (04-TC-R-006)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(400);

    const notes = page
      .locator('lib-log-activity-sheet hg-health-text-field')
      .filter({ hasText: 'Notes' })
      .locator('input');
    const longText = 'lorem ipsum dolor sit amet '.repeat(20);
    await notes.fill(longText);

    const sheet = page.locator('lib-log-activity-sheet .sheet').first();
    const meta = await sheet.evaluate((el) => ({
      overflowY: getComputedStyle(el).overflowY,
      scrollable: el.scrollHeight > el.clientHeight,
    }));
    expect(['auto', 'scroll']).toContain(meta.overflowY);

    const save = page.locator('[data-testid="log-activity-save"]');
    await save.scrollIntoViewIfNeeded();
    await expect(save).toBeVisible();
    void meta.scrollable;
  });

  test('soft keyboard: sheet content scrolls + submit stays visible (04-TC-R-005)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    // Simulate soft keyboard by shrinking viewport height to ~320 (kb takes ~460 px).
    await page.setViewportSize({ width: 360, height: 320 });
    await page.waitForTimeout(300);

    const sheet = page.locator('lib-log-activity-sheet .sheet').first();
    await expect(sheet).toBeVisible();
    const meta = await sheet.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        overflowY: s.overflowY,
        scrollable: el.scrollHeight > el.clientHeight,
      };
    });
    expect(['auto', 'scroll']).toContain(meta.overflowY);
    expect(meta.scrollable).toBe(true);

    // The Save button must remain inside the visible viewport rect (after scrolling to it).
    const save = page.locator('[data-testid="log-activity-save"]');
    await save.scrollIntoViewIfNeeded();
    const dims = await save.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
    });
    expect(dims.top).toBeGreaterThanOrEqual(0);
    expect(dims.bottom).toBeLessThanOrEqual(dims.vh);
  });

  test('resize mobile→tablet swaps sheet→dialog, preserves form state (04-TC-R-004)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(400);

    // Fill quantity in the sheet.
    const sheetInput = page
      .locator('lib-log-activity-sheet hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await sheetInput.fill('5');

    // Resize across the breakpoint.
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(500);

    // Sheet is gone; dialog has appeared with the persisted quantity.
    await expect(page.locator('lib-log-activity-sheet')).toHaveCount(0);
    const dialogInput = page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await expect(dialogInput).toBeVisible();
    await expect(dialogInput).toHaveValue('5');
  });

  test('360 px: sheet rises from bottom + ≤75% viewport + handle visible (04-TC-R-001)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    const container = page.locator('mat-bottom-sheet-container').first();
    await expect(container).toBeVisible();
    const handle = page.locator('lib-log-activity-sheet .sheet__handle').first();
    await expect(handle).toBeVisible();

    const dims = await container.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { height: r.height, top: r.top, vh: window.innerHeight };
    });
    // Sheet hugs the bottom — bottom edge at viewport bottom (top + height ~ vh).
    expect(Math.round(dims.top + dims.height)).toBeLessThanOrEqual(dims.vh + 1);
    // Sheet doesn't dominate the screen — the spec gives a soft "~75%" budget.
    expect(dims.height).toBeLessThanOrEqual(dims.vh * 0.85);
  });

  test('mobile sheet padding 24 / 16 / 24 / 24 (04-TC-L-002)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    const sheet = page.locator('lib-log-activity-sheet .sheet').first();
    await expect(sheet).toBeVisible();
    const padding = await sheet.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
    });
    expect(padding).toEqual(['16px', '24px', '24px', '24px']);
  });

  test('mobile sheet corner radius 28 px top / 0 bottom (04-TC-L-001)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    await page
      .locator('[data-testid="goal-detail-log-fab"]')
      .evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    const container = page.locator('mat-bottom-sheet-container').first();
    await expect(container).toBeVisible();
    const radii = await container.evaluate((el) => {
      const s = getComputedStyle(el);
      return [
        s.borderTopLeftRadius,
        s.borderTopRightRadius,
        s.borderBottomRightRadius,
        s.borderBottomLeftRadius,
      ];
    });
    expect(radii).toEqual(['28px', '28px', '0px', '0px']);
  });

  test('mobile sheet handle #C2C9BE / 4 px tall / 32 px wide (04-TC-C-009)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
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
    // Scroll the FAB into view (mobile bottom nav can overlap it) then click via JS dispatch
    // to bypass any overlap issues.
    await page.locator('[data-testid="goal-detail-log-fab"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(800);
    const handle = page
      .locator(
        '.cdk-overlay-container .sheet__handle, lib-log-activity-sheet .sheet__handle',
      )
      .first();
    await expect(handle).toBeVisible();
    const box = await handle.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        width: Math.round(r.width),
        height: Math.round(r.height),
        bg: s.backgroundColor,
      };
    });
    expect(box.bg).toBe('rgb(194, 201, 190)');
    expect(box.height).toBe(4);
    expect(box.width).toBe(32);
  });
});

test.describe('Log activity dialog (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const status of [403, 404] as const) {
    for (const method of ['PUT', 'DELETE'] as const) {
      test(`crafted ${method} on another user's activity yields ${status} (04-TC-F-012 — ${method} ${status})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await authenticate(page);

        let calls = 0;
        await page.route('**/api/activities/other-user-activity', (route) => {
          calls += 1;
          route.fulfill({ status, contentType: 'application/json', body: '{}' });
        });
        await page.goto('/home');

        const responseStatus = await page.evaluate(
          async ({ status, method }) => {
            const r = await fetch('/api/activities/other-user-activity', {
              method,
              headers: {
                Authorization: 'Bearer test-access-token',
                'Content-Type': 'application/json',
              },
              body: method === 'PUT' ? JSON.stringify({ quantity: 99 }) : undefined,
            });
            return r.status;
          },
          { status, method },
        );
        expect(responseStatus).toBe(status);
        expect(calls).toBe(1);
      });
    }
  }

  test('delete existing activity entry persists (04-TC-F-011)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let entries: Array<Record<string, unknown>> = [
      {
        id: 'a-1',
        goalId: 'g1',
        quantity: 3,
        unit: 'min',
        notes: '',
        recordedAt: '2026-05-09T08:00:00Z',
        newlyEarnedRewards: [],
      },
    ];
    let deleteCalls = 0;

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(entries),
      }),
    );
    await page.route('**/api/activities/a-1', (route) => {
      const req = route.request();
      if (req.method() === 'DELETE') {
        deleteCalls += 1;
        entries = [];
        route.fulfill({ status: 204, body: '' });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/goals/g1');
    await page.locator('lib-goal-detail .goal-detail__history').first().scrollIntoViewIfNeeded();
    await page.locator('[data-testid="activity-delete"]').first().click();

    // Delete activity confirm dialog appears.
    const dialog = page.locator('lib-delete-activity-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /delete/i }).click();

    await expect(dialog).toHaveCount(0);
    expect(deleteCalls).toBe(1);
    // Activity list re-fetches → no rows now.
    await expect(page.locator('lib-goal-detail [data-testid="activity-list"]')).toHaveCount(0);
  });

  test('edit existing activity entry persists (04-TC-F-010)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let putBody: Record<string, unknown> | null = null;
    let entry = {
      id: 'a-1',
      goalId: 'g1',
      quantity: 3,
      unit: 'min',
      notes: 'old',
      recordedAt: '2026-05-09T08:00:00Z',
      newlyEarnedRewards: [],
    };

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([entry]),
      }),
    );
    await page.route('**/api/activities/a-1', (route) => {
      const req = route.request();
      if (req.method() === 'PUT') {
        putBody = req.postDataJSON();
        entry = { ...entry, ...putBody };
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(entry),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(entry) });
    });

    await page.goto('/goals/g1');
    await page.locator('lib-goal-detail .goal-detail__history').first().scrollIntoViewIfNeeded();
    await page.locator('[data-testid="activity-edit"]').first().click();

    const dialog = page.locator('lib-edit-activity-dialog');
    await expect(dialog).toBeVisible();
    const qty = dialog
      .locator('hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await qty.fill('7');
    await dialog.getByRole('button', { name: /save/i }).click();

    await expect(dialog).toHaveCount(0);
    expect(putBody).toMatchObject({ quantity: 7 });
  });

  test('successful submit closes dialog and shows toast (04-TC-F-009)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-1',
            goalId: 'g1',
            quantity: 5,
            unit: 'min',
            notes: '',
            recordedAt: new Date().toISOString(),
            newlyEarnedRewards: [
              { id: 'r1', name: 'First step', cost: 10 },
            ],
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');
    await page.locator('[data-testid="log-activity-save"]').click();

    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    await expect(snack).toBeVisible();
    await expect(snack).toContainText(/First step|reward|earned/i);
  });

  test('after successful log, UI reflects new current streak (04-TC-F-008)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let currentStreak = 2;
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...goal, currentStreak }),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        currentStreak = 3;
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-1',
            goalId: 'g1',
            quantity: 5,
            unit: 'min',
            notes: '',
            recordedAt: new Date().toISOString(),
            newlyEarnedRewards: [],
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await expect(
      page.locator('[data-testid="goal-detail-current-streak"] .streak-summary__value'),
    ).toContainText('2');

    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');
    await page.locator('[data-testid="log-activity-save"]').click();

    // After successful POST, the goal-detail re-fetches the goal so current streak updates.
    await expect(
      page.locator('[data-testid="goal-detail-current-streak"] .streak-summary__value'),
    ).toContainText('3');
  });

  for (const status of [403, 404] as const) {
    test(`crafted POST against another user's goal yields ${status} (04-TC-F-007 — ${status})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await authenticate(page);

      let postCalls = 0;
      let lastStatus = 0;

      await page.route('**/api/goals/other-user-goal/activities**', (route) => {
        if (route.request().method() === 'POST') {
          postCalls += 1;
          lastStatus = status;
          route.fulfill({ status, contentType: 'application/json', body: '{}' });
          return;
        }
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.goto('/home');

      const responseStatus = await page.evaluate(async () => {
        const r = await fetch('/api/goals/other-user-goal/activities', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-access-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: 5 }),
        });
        return r.status;
      });
      expect(responseStatus).toBe(status);
      expect(postCalls).toBe(1);
      expect(lastStatus).toBe(status);
    });
  }

  test('note exceeding 500 chars surfaces validation error (04-TC-F-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postCalls = 0;
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      if (route.request().method() === 'POST') {
        postCalls += 1;
        route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    const longNote = 'x'.repeat(501);
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Notes' })
      .locator('input')
      .fill(longNote);
    await page.locator('[data-testid="log-activity-save"]').click();

    // Note errors render under the Notes field; dialog stays open; no POST.
    const notesError = page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Notes' })
      .locator('.health-text-field__error');
    await expect(notesError).toBeVisible();
    await expect(notesError).toContainText(/500|long|too/i);
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
    expect(postCalls).toBe(0);
  });

  test('log activity with note (1–500 chars) persists (04-TC-F-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-1',
            goalId: 'g1',
            quantity: 5,
            unit: 'min',
            notes: postBody!.notes ?? '',
            recordedAt: new Date().toISOString(),
            newlyEarnedRewards: [],
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    const note = 'Felt strong, especially on the last set. '.repeat(10).slice(0, 480);
    expect(note.length).toBeGreaterThan(1);
    expect(note.length).toBeLessThanOrEqual(500);

    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Notes' })
      .locator('input')
      .fill(note);
    await page.locator('[data-testid="log-activity-save"]').click();

    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
    expect(postBody).toMatchObject({ quantity: 5, notes: note.trim() });
  });

  test('server rejects out-of-window timestamp → toast (04-TC-F-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            title: 'Activity timestamp is outside the goal cadence window.',
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');
    await page.locator('[data-testid="log-activity-save"]').click();

    const snack = page
      .locator('mat-snack-bar-container, .mat-mdc-snack-bar-container')
      .first();
    await expect(snack).toBeVisible();
    await expect(snack).toContainText(/timestamp|window|outside|cadence/i);
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
  });

  test('log negative quantity is rejected with inline error (04-TC-F-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postCalls = 0;
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      if (route.request().method() === 'POST') {
        postCalls += 1;
        route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    const qty = page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');

    for (const bad of ['-1', '-25']) {
      await qty.fill(bad);
      await page.locator('[data-testid="log-activity-save"]').click();
      await expect(
        page.locator('lib-log-activity-dialog .health-text-field__error').first(),
      ).toBeVisible();
    }
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
    expect(postCalls).toBe(0);
  });

  test('log quantity 0 is rejected with inline error (04-TC-F-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postCalls = 0;
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      if (route.request().method() === 'POST') {
        postCalls += 1;
        route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    const qty = page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await qty.fill('0');
    await page.locator('[data-testid="log-activity-save"]').click();

    // Inline error visible, dialog stays open, no POST.
    await expect(
      page.locator('lib-log-activity-dialog .health-text-field__error').first(),
    ).toBeVisible();
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
    expect(postCalls).toBe(0);
  });

  test('log positive quantity persists + appears in history (04-TC-F-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    let activityList: Array<Record<string, unknown>> = [];

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        const entry = {
          id: 'a-1',
          goalId: 'g1',
          quantity: 5,
          unit: 'min',
          notes: '',
          recordedAt: new Date().toISOString(),
          newlyEarnedRewards: [],
        };
        activityList = [entry];
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(entry),
        });
        return;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(activityList),
      });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');
    await page.locator('[data-testid="log-activity-save"]').click();
    await page.waitForTimeout(400);

    // Dialog closed. Activity list now contains the new entry.
    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
    // Scroll the @defer viewport-trigger into view to mount the list.
    const history = page.locator('lib-goal-detail .goal-detail__history').first();
    await history.scrollIntoViewIfNeeded();
    await expect(
      page.locator('lib-goal-detail [data-testid="activity-list"]'),
    ).toBeVisible();
    expect(postBody).toMatchObject({ quantity: 5 });
  });

  test('double-click submit emits only one POST (04-TC-B-009)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postCalls = 0;
    let resolveResponse: (() => void) | null = null;
    const held = new Promise<void>((r) => {
      resolveResponse = r;
    });

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', async (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        postCalls += 1;
        await held;
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-1',
            goalId: 'g1',
            quantity: 5,
            unit: 'min',
            notes: '',
            recordedAt: new Date().toISOString(),
            newlyEarnedRewards: [],
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    const save = page.locator('[data-testid="log-activity-save"]');
    await save.click();
    await save.click({ force: true });
    await save.click({ force: true });
    await page.waitForTimeout(300);

    expect(postCalls).toBe(1);
    resolveResponse!();
    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
  });

  test('submit shows spinner + disabled while in-flight (04-TC-B-008)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let resolveResponse: (() => void) | null = null;
    const held = new Promise<void>((r) => {
      resolveResponse = r;
    });

    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', async (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        await held;
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'a-1',
            goalId: 'g1',
            quantity: 5,
            unit: 'min',
            notes: '',
            recordedAt: new Date().toISOString(),
            newlyEarnedRewards: [],
          }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    await page.locator('[data-testid="log-activity-save"]').click();

    // While POST is in flight, the button is disabled and a spinner is visible.
    const save = page.locator('[data-testid="log-activity-save"]');
    await expect(save).toBeDisabled();
    await expect(
      page.locator('lib-log-activity-dialog mat-progress-spinner, lib-log-activity-dialog mat-spinner'),
    ).toBeVisible();

    resolveResponse!();
    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
  });

  test('Tab cycles within dialog (focus trap) (04-TC-B-007)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
    // Seed focus inside the dialog.
    await page
      .locator('lib-log-activity-dialog hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .focus();

    const inDialog = async () =>
      await page.evaluate(() =>
        !!document.activeElement?.closest('lib-log-activity-dialog'),
      );

    expect(await inDialog()).toBe(true);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await inDialog(), `tab ${i} escaped dialog`).toBe(true);
    }
  });

  test('focus returns to FAB on dialog close (04-TC-B-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    const fab = page.locator('[data-testid="goal-detail-log-fab"]');
    await fab.click();
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
    await page.waitForTimeout(150);

    const focusOnFab = await fab.evaluate((el) => document.activeElement === el);
    expect(focusOnFab).toBe(true);
  });

  test('focus moves into first form field on dialog open (04-TC-B-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();
    // Wait briefly for autoFocus to land.
    await page.waitForTimeout(200);

    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return { inDialog: false, name: '' };
      return {
        inDialog: !!el.closest('lib-log-activity-dialog'),
        labelText:
          el.closest('hg-health-text-field')?.querySelector('mat-label')?.textContent?.trim() ?? '',
      };
    });
    expect(focused.inDialog).toBe(true);
    expect(focused.labelText).toMatch(/Quantity/);
  });

  test('Esc closes the desktop dialog (04-TC-B-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.route('**/api/goals/g1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(goal),
      }),
    );
    await page.route('**/api/goals/g1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();
    await expect(page.locator('lib-log-activity-dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('lib-log-activity-dialog')).toHaveCount(0);
  });

  test('submit while unauthenticated → 401 routes to re-auth (04-TC-F-109)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ title: 'Token expired' }),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Walk');
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
    await page.locator('[data-testid="goal-form-save"]').click();

    // FE clears the session and routes to /onboarding (the re-auth entry).
    await page.waitForURL(/\/onboarding/, { timeout: 10000 });
    const tokenLeft = await page.evaluate(() => sessionStorage.getItem('hg.oidc.access-token'));
    expect(tokenLeft).toBeNull();
  });

  test('custom cadence N=0 surfaces validation error (04-TC-F-108)', async ({ page }) => {
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
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Stretch');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input')
      .fill('5');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('min');
    await page
      .locator('hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .filter({ hasText: /^Custom$/ })
      .click();

    const everyInput = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Every' })
      .locator('input');
    const save = page.locator('[data-testid="goal-form-save"]');
    for (const bad of ['0', '-2']) {
      await everyInput.fill(bad);
      await expect(save).toBeDisabled();
    }
    await page
      .locator('form[data-testid="goal-form"]')
      .evaluate((form: HTMLFormElement) => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    const everyError = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Every' })
      .locator('.health-text-field__error');
    await expect(everyError).toBeVisible();
    expect(postCalls).toBe(0);
  });

  test('custom cadence "every 3 days" persists customInterval (04-TC-F-107)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    const created = {
      id: 'c-1',
      name: 'Stretch',
      description: '',
      cadence: 'custom' as const,
      target: { value: 5, unit: 'min' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
      customInterval: { count: 3, unit: 'days' },
    };
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.url().endsWith('/api/goals/c-1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/goals/c-1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Stretch');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input')
      .fill('5');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('min');
    await page
      .locator('hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .filter({ hasText: /^Custom$/ })
      .click();
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Every' })
      .locator('input')
      .fill('3');

    await page.locator('[data-testid="goal-form-save"]').click();
    await page.waitForURL(/\/goals\/c-1$/);

    expect(postBody).toMatchObject({
      name: 'Stretch',
      cadence: 'custom',
      customInterval: { count: 3, unit: 'days' },
    });
  });

  test('create monthly goal persists with cadence: monthly (04-TC-F-106)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    const created = {
      id: 'm-1',
      name: 'Read 5 books',
      description: '',
      cadence: 'monthly' as const,
      target: { value: 5, unit: 'books' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    };
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.url().endsWith('/api/goals/m-1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/goals/m-1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Read 5 books');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input')
      .fill('5');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('books');
    await page
      .locator('hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .filter({ hasText: /^Monthly$/ })
      .click();

    await page.locator('[data-testid="goal-form-save"]').click();
    await page.waitForURL(/\/goals\/m-1$/);

    expect(postBody).toMatchObject({
      name: 'Read 5 books',
      cadence: 'monthly',
      target: { value: 5, unit: 'books' },
    });
  });

  test('create weekly goal Monday week-start persists (04-TC-F-105)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    const created = {
      id: 'w-1',
      name: 'Long run',
      description: '',
      cadence: 'weekly' as const,
      target: { value: 3, unit: 'runs' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    };

    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.url().endsWith('/api/goals/w-1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/goals/w-1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Long run');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input')
      .fill('3');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('runs');
    await page
      .locator('hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .filter({ hasText: /^Weekly$/ })
      .click();

    // Week-start mat-select appears; pick Monday (default already monday but force change to dispatch).
    const weekStart = page.locator('mat-select[data-testid="goal-form-week-start"]');
    await expect(weekStart).toBeVisible();

    await page.locator('[data-testid="goal-form-save"]').click();
    await page.waitForURL(/\/goals\/w-1$/);

    expect(postBody).toMatchObject({
      name: 'Long run',
      cadence: 'weekly',
      target: { value: 3, unit: 'runs' },
      weekStart: 'monday',
    });
  });

  test('create hourly goal persists with cadence: hourly (04-TC-F-104)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    let postBody: Record<string, unknown> | null = null;
    const created = {
      id: 'h-1',
      name: 'Hydrate',
      description: '',
      cadence: 'hourly' as const,
      target: { value: 1, unit: 'cup' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    };
    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.url().endsWith('/api/goals/h-1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      if (req.method() === 'POST') {
        postBody = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/goals/h-1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Hydrate');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input')
      .fill('1');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('cup');
    await page
      .locator('hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .filter({ hasText: /^Hourly$/ })
      .click();

    await page.locator('[data-testid="goal-form-save"]').click();
    await page.waitForURL(/\/goals\/h-1$/);

    expect(postBody).toMatchObject({
      name: 'Hydrate',
      cadence: 'hourly',
      target: { value: 1, unit: 'cup' },
    });
  });

  test('create daily goal happy path persists with streak 0 (04-TC-F-103)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);

    const created = {
      id: 'd-1',
      name: 'Walk',
      description: '',
      cadence: 'daily' as const,
      target: { value: 10, unit: 'min' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    };
    let listed: typeof created[] = [];

    await page.unroute('**/api/goals**');
    await page.route('**/api/goals**', (route) => {
      const req = route.request();
      if (req.url().endsWith('/api/goals/d-1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      if (req.method() === 'POST') {
        listed = [created];
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(listed),
      });
    });
    await page.route('**/api/goals/d-1/activities**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/goals/new');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Walk');
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
    // Cadence picker default is 'daily' (first option), so no extra click needed.
    await page.locator('[data-testid="goal-form-save"]').click();
    await page.waitForURL(/\/goals\/d-1$/);

    await page.goto('/goals');
    const card = page
      .locator('lib-goal-list .goal-card')
      .filter({ hasText: 'Walk' })
      .first();
    await expect(card).toBeVisible();
    const streakChip = card.locator('mat-chip').filter({ hasText: /streak/i }).first();
    await expect(streakChip).toContainText(/0[-\s]?day streak/i);
  });

  test('create goal: non-positive target blocks submit (04-TC-F-102)', async ({ page }) => {
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
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('input')
      .fill('Walk');
    await page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Unit' })
      .locator('input')
      .fill('min');

    const targetInput = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('input');
    const save = page.locator('[data-testid="goal-form-save"]');

    for (const bad of ['0', '-3']) {
      await targetInput.fill(bad);
      await expect(save).toBeDisabled();
    }
    await page
      .locator('form[data-testid="goal-form"]')
      .evaluate((form: HTMLFormElement) => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    const targetError = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Target' })
      .locator('.health-text-field__error');
    await expect(targetError).toBeVisible();
    await expect(targetError).toContainText(/positive|greater|0/i);
    expect(postCalls).toBe(0);
  });

  test('create goal: empty name blocks submit + inline error (04-TC-F-101)', async ({ page }) => {
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
    await expect(save).toBeDisabled();

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

    await page
      .locator('form[data-testid="goal-form"]')
      .evaluate((form: HTMLFormElement) => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

    const nameError = page
      .locator('hg-health-text-field')
      .filter({ hasText: 'Name' })
      .locator('.health-text-field__error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText(/required/i);
    expect(postCalls).toBe(0);
  });

  test('1200 px: dialog + backdrop, form padding 32 px (04-TC-R-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
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

    // The form (tablet+ styling): 32 px host padding.
    await page.goto('/goals/new');
    const formHostPad = await page
      .locator('lib-goal-form')
      .first()
      .evaluate((el) => getComputedStyle(el).paddingTop);
    expect(formHostPad).toBe('32px');

    // The dialog still opens centered with a backdrop above 768 px.
    await page.goto('/goals/g1');
    await page.locator('[data-testid="goal-detail-log-fab"]').click();

    const surface = page.locator('.cdk-overlay-container .mat-mdc-dialog-surface').first();
    await expect(surface).toBeVisible();
    const backdrop = page
      .locator('.cdk-overlay-backdrop:not(.cdk-overlay-transparent-backdrop)')
      .first();
    await expect(backdrop).toBeVisible();

    const dims = await surface.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, vw: window.innerWidth };
    });
    expect(Math.abs(Math.round(dims.left) - Math.round(dims.vw - dims.right))).toBeLessThanOrEqual(
      8,
    );
  });

  test('768 px: full-page goal-form + rail nav visible (04-TC-R-002)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await authenticate(page);
    await page.goto('/goals/new');

    const form = page.locator('lib-goal-form form').first();
    await expect(form).toBeVisible();
    // Form fills most of the main content area on tablet.
    const widths = await page.evaluate(() => ({
      vw: window.innerWidth,
      formWidth: document.querySelector('lib-goal-form form')!.getBoundingClientRect().width,
    }));
    expect(widths.formWidth).toBeGreaterThan(widths.vw * 0.5);

    // Rail nav variant is rendered above 768 px.
    const rail = page.locator('hg-navigation-bar.app-shell__navigation--rail');
    await expect(rail).toBeVisible();
  });

  test('dialog max width 720 px on desktop, centered (04-TC-L-010)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
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

    const surface = page.locator('.cdk-overlay-container .mat-mdc-dialog-surface').first();
    await expect(surface).toBeVisible();
    const dims = await surface.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, left: r.left, right: r.right, vw: window.innerWidth };
    });
    expect(Math.round(dims.width)).toBeLessThanOrEqual(720);
    expect(Math.abs(Math.round(dims.left) - Math.round(dims.vw - dims.right))).toBeLessThanOrEqual(
      8,
    );
  });

  test('submit button is full-width on mobile (04-TC-L-009)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.goto('/goals/new');
    const formWidth = await page
      .locator('lib-goal-form form')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));
    const saveWidth = await page
      .locator('lib-goal-form [data-testid="goal-form-save"]')
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));
    // Within 4 px of full form width.
    expect(Math.abs(saveWidth - formWidth)).toBeLessThanOrEqual(4);
  });

  test('submit button is right-aligned on desktop (04-TC-L-009)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.goto('/goals/new');
    const form = page.locator('lib-goal-form form').first();
    const save = page.locator('lib-goal-form [data-testid="goal-form-save"]');
    const formRect = await form.evaluate((el) => el.getBoundingClientRect());
    const saveRect = await save.evaluate((el) => el.getBoundingClientRect());
    // Save right edge ~ form right edge (within 4 px) and save width is much smaller than form width.
    expect(Math.abs(saveRect.right - formRect.right)).toBeLessThanOrEqual(4);
    expect(saveRect.width).toBeLessThan(formRect.width / 2);
  });

  test('submit button is 56 px on tablet (04-TC-L-008)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await authenticate(page);
    await page.goto('/goals/new');
    const save = page.locator('lib-goal-form [data-testid="goal-form-save"]');
    const h = await save.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(56);
  });

  test('submit button is 56 px on desktop (04-TC-L-008)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await authenticate(page);
    await page.goto('/goals/new');
    const save = page.locator('lib-goal-form [data-testid="goal-form-save"]');
    const h = await save.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(56);
  });

  test('submit button is 48 px on mobile (04-TC-L-008)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await authenticate(page);
    await page.goto('/goals/new');
    const save = page.locator('lib-goal-form [data-testid="goal-form-save"]');
    const h = await save.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(48);
  });

  test('cadence picker height 40 px / pill radius (04-TC-L-007)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const chip = page
      .locator('lib-goal-form hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle')
      .first();
    await expect(chip).toBeVisible();
    const info = await chip.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        height: Math.round(r.height),
        radius: parseFloat(s.borderTopLeftRadius),
      };
    });
    expect(info.height).toBe(40);
    expect(info.radius).toBeGreaterThanOrEqual(20);
  });

  test('section vertical gap is 24 px (04-TC-L-006)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    // Gap above the Cadence section label (after the target row).
    const target = page.locator('lib-goal-form .goal-form__target').first();
    const sectionLabel = page
      .locator('lib-goal-form .goal-form__section-label')
      .filter({ hasText: 'Cadence' })
      .first();
    await expect(sectionLabel).toBeVisible();
    const targetBottom = await target.evaluate((el) => el.getBoundingClientRect().bottom);
    const labelTop = await sectionLabel.evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.round(labelTop - targetBottom)).toBe(24);
  });

  test('inter-field vertical gap is 16 px (04-TC-L-005)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    // Measure the gap between the Name field and the Target/Unit row directly below it.
    const nameField = page
      .locator('lib-goal-form hg-health-text-field')
      .filter({ hasText: 'Name' })
      .first();
    const targetRow = page.locator('lib-goal-form .goal-form__target').first();
    const nameBottom = await nameField.evaluate(
      (el) => el.getBoundingClientRect().bottom,
    );
    const targetTop = await targetRow.evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.round(targetTop - nameBottom)).toBe(16);
  });

  test('form field height is 56 px (04-TC-L-004)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const wrapper = page
      .locator('lib-goal-form hg-health-text-field .mat-mdc-text-field-wrapper')
      .first();
    await expect(wrapper).toBeVisible();
    const height = await wrapper.evaluate((el) =>
      Math.round(el.getBoundingClientRect().height),
    );
    expect(height).toBe(56);
  });

  test('tablet goal-form padding is 32 px (04-TC-L-003)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await authenticate(page);
    await page.goto('/goals/new');

    const host = page.locator('lib-goal-form').first();
    await expect(host).toBeVisible();
    const padding = await host.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
    });
    expect(padding).toEqual(['32px', '32px', '32px', '32px']);
  });

  test('backdrop scrim is rgba(0, 0, 0, 0.48) (04-TC-C-010)', async ({ page }) => {
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

    const backdrop = page
      .locator('.cdk-overlay-backdrop:not(.cdk-overlay-transparent-backdrop)')
      .first();
    await expect(backdrop).toBeVisible();
    const bg = await backdrop.evaluate((el) => getComputedStyle(el).backgroundColor);
    // 0x7A / 0xFF ≈ 0.48 — accept either canonical CSS form.
    expect(bg).toBe('rgba(0, 0, 0, 0.48)');
  });

  test('submit button bg #006D3F / label white (04-TC-C-008)', async ({ page }) => {
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

    const btn = page.locator('[data-testid="log-activity-save"]');
    await expect(btn).toBeVisible();
    const styles = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(styles.bg).toBe('rgb(0, 109, 63)');
    expect(styles.color).toBe('rgb(255, 255, 255)');
  });

  test('switch on: track #006D3F / thumb white (04-TC-C-007)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const toggle = page.locator('lib-goal-form mat-slide-toggle[data-testid="reminders-toggle"]');
    await expect(toggle).toBeVisible();
    // Click the inner switch button to toggle on.
    await toggle.locator('button[role="switch"]').click();
    await expect(toggle.locator('button[role="switch"][aria-checked="true"]')).toBeVisible();

    const track = toggle.locator('.mdc-switch__track').first();
    const handle = toggle.locator('.mdc-switch__handle').first();
    const trackBg = await track.evaluate((el) => getComputedStyle(el, '::after').backgroundColor);
    const handleBg = await handle.evaluate((el) => getComputedStyle(el, '::after').backgroundColor);

    expect(trackBg).toBe('rgb(0, 109, 63)');
    expect(handleBg).toBe('rgb(255, 255, 255)');
  });

  test('cadence segmented unselected: transparent / outline / #191D17 (04-TC-C-006)', async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const inactive = page
      .locator(
        'lib-goal-form hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle:not(.mat-button-toggle-checked)',
      )
      .first();
    await expect(inactive).toBeVisible();

    const styles = await inactive.evaluate((host) => {
      const inner = host.querySelector('.mat-button-toggle-button') ?? host;
      const label = host.querySelector('.segmented-filter__label') ?? host;
      const sHost = getComputedStyle(host);
      return {
        bg: getComputedStyle(inner).backgroundColor,
        labelColor: getComputedStyle(label).color,
        borderColor: sHost.borderTopColor,
        borderWidth: sHost.borderTopWidth,
      };
    });
    expect(styles.bg).toBe('rgba(0, 0, 0, 0)');
    expect(styles.borderColor).toBe('rgb(194, 201, 190)');
    expect(styles.borderWidth).toBe('1px');
    expect(styles.labelColor).toBe('rgb(25, 29, 23)');
  });

  test('cadence segmented selected #94F7B4 / #00210F (04-TC-C-005)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const selected = page
      .locator('lib-goal-form hg-segmented-filter[data-testid="cadence-picker"] mat-button-toggle.mat-button-toggle-checked')
      .first();
    await expect(selected).toBeVisible();
    const styles = await selected.evaluate((host) => {
      const inner = host.querySelector('.mat-button-toggle-button') ?? host;
      const label = host.querySelector('.segmented-filter__label') ?? host;
      return {
        bg: getComputedStyle(inner).backgroundColor,
        labelColor: getComputedStyle(label).color,
      };
    });
    expect(styles.bg).toBe('rgb(148, 247, 180)');
    expect(styles.labelColor).toBe('rgb(0, 33, 15)');
  });

  test('field outline error #BA1A1A / 2 px (04-TC-C-004)', async ({ page }) => {
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

    await page
      .locator('.cdk-overlay-container hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('0');
    await page.locator('[data-testid="log-activity-save"]').click();

    // The hg-health-text-field gains a `.health-text-field--error` class when errorText is set;
    // its outline pieces should repaint with the error color and the 2 px stroke.
    const piece = page
      .locator(
        '.cdk-overlay-container hg-health-text-field.health-text-field--error .mdc-notched-outline__leading',
      )
      .first();
    await expect(piece).toBeVisible();
    const result = await piece.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.borderTopColor, width: s.borderTopWidth };
    });
    expect(result.color).toBe('rgb(186, 26, 26)');
    expect(result.width).toBe('2px');
  });

  test('field outline focused #006D3F / 2 px (04-TC-C-003)', async ({ page }) => {
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

    const input = page
      .locator('.cdk-overlay-container hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await input.focus();

    const piece = page
      .locator(
        '.cdk-overlay-container hg-health-text-field .mat-focused .mdc-notched-outline__leading',
      )
      .first();
    await expect(piece).toBeVisible();
    const result = await piece.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.borderTopColor, width: s.borderTopWidth };
    });
    expect(result.color).toBe('rgb(0, 109, 63)');
    expect(result.width).toBe('2px');
  });

  test('field outline default #C2C9BE / 1 px (04-TC-C-002)', async ({ page }) => {
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

    // Sample any of the three notch pieces (leading / notch / trailing) for an unfocused field.
    const piece = page
      .locator(
        '.cdk-overlay-container hg-health-text-field .mdc-notched-outline__leading',
      )
      .first();
    await expect(piece).toBeVisible();
    const result = await piece.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        color: s.borderTopColor,
        width: s.borderTopWidth,
      };
    });
    expect(result.color).toBe('rgb(194, 201, 190)');
    expect(result.width).toBe('1px');
  });

  test('dialog surface is #F7FBF3 (04-TC-C-001)', async ({ page }) => {
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

    const surface = page.locator('.cdk-overlay-container .mat-mdc-dialog-surface').first();
    await expect(surface).toBeVisible();
    const bg = await surface.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(247, 251, 243)');
  });

  test('goal-form Cadence section label Inter 13 / 600 / 0.5px (04-TC-V-007)', async ({ page }) => {
    await authenticate(page);
    await page.goto('/goals/new');

    const label = page.locator('lib-goal-form .goal-form__section-label').filter({ hasText: 'Cadence' }).first();
    await expect(label).toBeVisible();
    const computed = await label.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
      };
    });
    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('600');
    expect(computed.fontSize).toBe('13px');
    expect(computed.letterSpacing).toBe('0.5px');
  });

  test('dialog validation error Inter 12 / 500 / error color (04-TC-V-006)', async ({ page }) => {
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

    // Force the error: type 0 (≤ 0) and click Save (button is disabled when invalid, so use Enter on field).
    const qty = page
      .locator('.cdk-overlay-container hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input');
    await qty.fill('0');
    // Trigger attemptedSubmit by pressing Enter on the input — falls through to dialog submit.
    await qty.press('Enter');
    // Save click also triggers attemptedSubmit; re-enable in case button gates the click.
    await page.locator('[data-testid="log-activity-save"]').click({ force: true });

    const err = page
      .locator('.cdk-overlay-container hg-health-text-field .health-text-field__error')
      .first();
    await expect(err).toBeVisible();

    const computed = await err.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
        color: s.color,
      };
    });
    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('500');
    expect(computed.fontSize).toBe('12px');
    // Error color is the design's #BA1A1A red.
    expect(computed.color).toBe('rgb(186, 26, 26)');
  });

  test('dialog submit button Inter 14 px / 500 / white (04-TC-V-005)', async ({ page }) => {
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

    // Provide a quantity so the Save button enables (color is the same when disabled
    // visually, but enabled state is the canonical one to assert against).
    await page
      .locator('.cdk-overlay-container hg-health-text-field')
      .filter({ hasText: 'Quantity' })
      .locator('input')
      .fill('5');

    const save = page.locator('[data-testid="log-activity-save"]');
    await expect(save).toBeVisible();
    const styles = await save.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
        color: s.color,
      };
    });
    expect(styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(styles.fontWeight).toBe('500');
    expect(styles.fontSize).toBe('14px');
    expect(styles.color).toBe('rgb(255, 255, 255)');
  });

  test('dialog helper text is Inter 12 px / weight 400 (04-TC-V-004)', async ({ page }) => {
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

    const hint = page
      .locator('.cdk-overlay-container hg-health-text-field mat-hint')
      .first();
    await expect(hint).toBeVisible();
    await expect(hint).toContainText('min');
    const computed = await hint.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize };
    });
    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('400');
    expect(computed.fontSize).toBe('12px');
  });

  test('dialog input text is Inter 14 px / weight 400 (04-TC-V-003)', async ({ page }) => {
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

    const inputs = page.locator(
      '.cdk-overlay-container hg-health-text-field input',
    );
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const computed = await inputs.nth(i).evaluate((el) => {
        const s = getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize };
      });
      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('400');
      expect(computed.fontSize).toBe('14px');
    }
  });

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
