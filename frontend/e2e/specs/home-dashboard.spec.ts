// Acceptance Test
// Traces to: 02-TC-V-001
// Description: Dashboard greeting renders with Inter font, weight 500, sizes 22/28/32 px (mobile/tablet/desktop).
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
  });
});
