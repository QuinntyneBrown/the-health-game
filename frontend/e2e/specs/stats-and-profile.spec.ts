// Acceptance Test
// Traces to: 06-TC-V-001..007, 06-TC-C-001
// Description: stats + profile page chrome.
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

test.describe('Stats & Profile chrome', () => {
  test('Stats + Profile pages background #F1F5ED (06-TC-C-001)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    const checkBg = async (path: string, host: string) => {
      await page.goto(path);
      const target = page.locator(host).first();
      await expect(target).toBeVisible();
      const bg = await target.evaluate((el) => getComputedStyle(el).backgroundColor);
      return bg;
    };

    expect(await checkBg('/stats', 'lib-stats')).toBe('rgb(241, 245, 237)');
    expect(await checkBg('/profile', 'lib-profile')).toBe('rgb(241, 245, 237)');
  });

  test('Delete account button Inter 14 px / 500 (06-TC-V-007)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');

    const btn = page.locator('[data-testid="profile-delete"]');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(/Delete account/i);
    const result = await btn.evaluate((el) => {
      // Find the descendant whose text matches "Delete account" — that's the
      // span carrying the visible label, regardless of MDC class.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
      let node: Element | null = el;
      let target: Element | null = null;
      while ((node = walker.nextNode() as Element | null)) {
        if ((node.textContent ?? '').trim() === 'Delete account') {
          target = node;
          break;
        }
      }
      const s = getComputedStyle(target ?? el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('14px');
    expect(result.weight).toBe('500');
  });

  test('body copy Inter 14 px / 400 / line-height 1.5 (06-TC-V-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');

    const body = page.locator('lib-profile [data-testid="profile-email"]').first();
    await expect(body).toBeVisible();
    const result = await body.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
        lineHeight: s.lineHeight,
      };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('14px');
    expect(result.weight).toBe('400');
    expect(result.lineHeight).toBe('21px');
  });

  test('profile form labels Inter 13 px / 500 (06-TC-V-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');
    await page.locator('[data-testid="profile-edit"]').click();

    const labelEls = await page
      .locator('lib-profile mat-form-field .mat-mdc-floating-label, lib-profile mat-form-field mat-label')
      .all();
    expect(labelEls.length).toBeGreaterThanOrEqual(2);
    for (const el of labelEls) {
      const result = await el.evaluate((node) => {
        const s = getComputedStyle(node);
        return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
      });
      expect(result.family).toMatch(/Inter/);
      expect(result.size).toBe('13px');
      expect(result.weight).toBe('500');
    }
  });

  test('section headings Inter 18 px / weight 500 (06-TC-V-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const heading = page.locator('lib-stats .stats-section__title').first();
    await expect(heading).toBeVisible();
    const result = await heading.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('18px');
    expect(result.weight).toBe('500');
  });

  test('stat label Inter 12 px / weight 500 (06-TC-V-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const label = page.locator('lib-stats .stat-tile__label').first();
    await expect(label).toBeVisible();
    const result = await label.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('12px');
    expect(result.weight).toBe('500');
  });

  test('stat headline numbers Inter 32 px / weight 600 (06-TC-V-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const tile = page.locator('lib-stats .stat-tile__value').first();
    await expect(tile).toBeVisible();
    const result = await tile.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(result.family).toMatch(/Inter/);
    expect(result.size).toBe('32px');
    expect(result.weight).toBe('600');
  });

  test('page titles "Stats"/"Profile" Inter 32 desktop / 22 mobile / 500 (06-TC-V-001)', async ({
    page,
  }) => {
    await authenticate(page);

    const measureTitle = async (path: string, expected: string) => {
      await page.goto(path);
      const heading = page
        .locator(`${path === '/stats' ? 'lib-stats' : 'lib-profile'} .page-header__title`)
        .first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText(expected);
      return heading;
    };

    await page.setViewportSize({ width: 1280, height: 900 });
    let h = await measureTitle('/stats', 'Stats');
    let r = await h.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(r.family).toMatch(/Inter/);
    expect(r.size).toBe('32px');
    expect(r.weight).toBe('500');

    h = await measureTitle('/profile', 'Profile');
    r = await h.evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight };
    });
    expect(r.family).toMatch(/Inter/);
    expect(r.size).toBe('32px');
    expect(r.weight).toBe('500');

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(80);
    const mobile = await page
      .locator('lib-profile .page-header__title')
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(mobile).toBe('22px');
  });
});
