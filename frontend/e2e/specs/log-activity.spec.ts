// Acceptance Test
// Traces to: 04-TC-V-001..007
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

test.describe('Log activity dialog (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

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
