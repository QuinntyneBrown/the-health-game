// Acceptance Test
// Traces to: 04-TC-V-001..007, 04-TC-C-001..009
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
