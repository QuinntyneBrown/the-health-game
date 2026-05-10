// Acceptance Test
// Traces to: 06-TC-V-001..007, 06-TC-C-001..010, 06-TC-L-001..003
// Description: stats + profile page chrome.
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

test.describe('Stats & Profile chrome', () => {
  test('stat tile padding 16 px (06-TC-L-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const tile = page.locator('lib-stats .stat-tile').first();
    await expect(tile).toBeVisible();
    const result = await tile.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        top: s.paddingTop,
        right: s.paddingRight,
        bottom: s.paddingBottom,
        left: s.paddingLeft,
      };
    });
    expect(result.top).toBe('16px');
    expect(result.right).toBe('16px');
    expect(result.bottom).toBe('16px');
    expect(result.left).toBe('16px');
  });

  test('stat tile corner radius 16 px (06-TC-L-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const tile = page.locator('lib-stats .stat-tile').first();
    await expect(tile).toBeVisible();
    const radius = await tile.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBe('16px');
  });

  test('stat tile grid 5 / 3 / 2 cols by viewport (06-TC-L-001)', async ({ page }) => {
    await authenticate(page);

    const measureCols = async () => {
      const grid = page.locator('lib-stats .stat-tiles').first();
      await expect(grid).toBeVisible();
      return grid.evaluate((el) =>
        getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      );
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/stats');
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(5);

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(3);

    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(120);
    expect(await measureCols()).toBe(2);
  });

  test('color contrast WCAG AA on Stats + Profile (06-TC-C-010)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);

    for (const path of ['/stats', '/profile']) {
      await page.goto(path);
      await expect(page.locator(path === '/stats' ? 'lib-stats' : 'lib-profile')).toBeVisible();
      const result = await new AxeBuilder({ page })
        .include(path === '/stats' ? 'lib-stats' : 'lib-profile')
        .withRules(['color-contrast'])
        .analyze();
      const blocking = result.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      if (blocking.length) {
        console.log(`${path}: ${blocking.map((v) => v.help).join(' | ')}`);
      }
      expect(blocking).toHaveLength(0);
    }
  });

  test('form outline default / focus / error (06-TC-C-009)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');
    await page.locator('[data-testid="profile-edit"]').click();

    const fields = page.locator('lib-profile mat-form-field');
    const defaultColor = await fields
      .first()
      .locator('.mdc-notched-outline__leading')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(defaultColor).toBe('rgb(194, 201, 190)');

    // Focus the email input and read its outline color/width.
    await page
      .locator('lib-profile hg-health-text-field')
      .filter({ hasText: 'Email' })
      .locator('input')
      .focus();
    await page.waitForTimeout(120);
    const focusMeta = await page
      .locator('lib-profile mat-form-field.mat-focused .mdc-notched-outline__leading')
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.borderTopColor, width: s.borderTopWidth };
      });
    expect(focusMeta.color).toBe('rgb(0, 109, 63)');
    expect(focusMeta.width).toBe('2px');

    // Trigger error: invalid email — the visible error renders via the
    // health-text-field--error host class and recolors the notched outline.
    await page
      .locator('lib-profile hg-health-text-field')
      .filter({ hasText: 'Email' })
      .locator('input')
      .fill('not-an-email');
    await page.waitForTimeout(120);
    const errorMeta = await page
      .locator(
        'lib-profile hg-health-text-field.health-text-field--error .mdc-notched-outline__leading',
      )
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.borderTopColor, width: s.borderTopWidth };
      });
    expect(errorMeta.color).toBe('rgb(186, 26, 26)');
    expect(parseFloat(errorMeta.width)).toBeGreaterThanOrEqual(1);
  });

  test('Delete account button #BA1A1A / white (06-TC-C-008)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');

    const btn = page.locator('[data-testid="profile-delete"]');
    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const labelColor = await btn.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
      let node: Element | null = el;
      let target: Element | null = null;
      while ((node = walker.nextNode() as Element | null)) {
        if ((node.textContent ?? '').trim() === 'Delete account') {
          target = node;
          break;
        }
      }
      return getComputedStyle(target ?? el).color;
    });
    expect(bg).toBe('rgb(186, 26, 26)');
    expect(labelColor).toBe('rgb(255, 255, 255)');
  });

  test('profile Save button #006D3F / white (06-TC-C-007)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');
    await page.locator('[data-testid="profile-edit"]').click();

    const save = page.locator('[data-testid="profile-save"]');
    await expect(save).toBeVisible();
    const bg = await save.evaluate((el) => getComputedStyle(el).backgroundColor);
    const labelColor = await save.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
      let node: Element | null = el;
      let target: Element | null = null;
      while ((node = walker.nextNode() as Element | null)) {
        if ((node.textContent ?? '').trim() === 'Save') {
          target = node;
          break;
        }
      }
      return getComputedStyle(target ?? el).color;
    });
    expect(bg).toBe('rgb(0, 109, 63)');
    expect(labelColor).toBe('rgb(255, 255, 255)');
  });

  test('profile avatar bg #94F7B4 / initial #00210F (06-TC-C-006)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/profile');

    const avatar = page.locator('lib-profile .profile__avatar--initial').first();
    await expect(avatar).toBeVisible();
    const result = await avatar.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(result.bg).toBe('rgb(148, 247, 180)');
    expect(result.color).toBe('rgb(0, 33, 15)');
  });

  test('chart axis labels #424940 (06-TC-C-005)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const label = page.locator('lib-stats .activity-chart__axis-label').first();
    await expect(label).toBeVisible();
    const color = await label.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(66, 73, 64)');
  });

  test('activity bar chart bars in #006D3F (06-TC-C-004)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const bar = page.locator('lib-stats .activity-chart__bar').first();
    await expect(bar).toBeVisible();
    const bg = await bar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(0, 109, 63)');
  });

  test('on-tile text colors match on-* tokens (06-TC-C-003)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const colors = await page.evaluate(() => {
      const map: Record<string, string> = {};
      for (const tone of ['success', 'streak', 'info', 'reward']) {
        const tile = document.querySelector(
          `lib-stats .stat-tile--${tone}`,
        ) as HTMLElement | null;
        if (tile) map[tone] = getComputedStyle(tile).color;
      }
      return map;
    });
    expect(colors.success).toBe('rgb(0, 33, 15)'); // #00210F on #94F7B4
    expect(colors.streak).toBe('rgb(52, 17, 0)'); // #341100 on #FFDCC4
    expect(colors.info).toBe('rgb(0, 31, 41)'); // #001F29 on #BEEAF6
    expect(colors.reward).toBe('rgb(56, 7, 30)'); // #38071E on #FFD7EE
  });

  test('stat tile palette success/streak/info/reward (06-TC-C-002)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await authenticate(page);
    await page.goto('/stats');

    const colors = await page.evaluate(() => {
      const map: Record<string, string> = {};
      for (const tone of ['success', 'streak', 'info', 'reward']) {
        const el = document.querySelector(
          `lib-stats .stat-tile.stat-tile--${tone}, lib-stats .stat-tile`,
        );
        // Pick the first tile of each tone via class match.
        const tiles = Array.from(document.querySelectorAll(`lib-stats .stat-tile--${tone}`));
        const node = (tiles[0] as HTMLElement) ?? (el as HTMLElement);
        if (node) map[tone] = getComputedStyle(node).backgroundColor;
      }
      return map;
    });
    expect(colors.success).toBe('rgb(148, 247, 180)');
    expect(colors.streak).toBe('rgb(255, 220, 196)');
    expect(colors.info).toBe('rgb(190, 234, 246)');
    expect(colors.reward).toBe('rgb(255, 215, 238)');
  });

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
