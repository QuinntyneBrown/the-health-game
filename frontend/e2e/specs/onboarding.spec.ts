// Acceptance Test
// Traces to: 01-TC-V-001, 01-TC-V-002, 01-TC-V-003, 01-TC-V-004
// Description: Onboarding headline ("Make health a game") renders with font family Inter weight 500
//              and the design-spec font-size at each breakpoint (mobile = 28 px, tablet = 45 px,
//              desktop = 57 px with line-height 1.1).
import { expect, test } from '@playwright/test';

test.describe('Onboarding — headline typography', () => {
  test('headline uses Inter font family with weight 500', async ({ page }) => {
    await page.goto('/onboarding');

    const headline = page.getByTestId('onboarding-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toHaveText('Make health a game');

    const computed = await headline.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
      };
    });

    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('500');
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 360, height: 780 } });

    test('headline font-size is 28 px on mobile (TC-V-002)', async ({ page }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const fontSize = await headline.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('28px');
    });
  });

  test.describe('tablet viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('headline font-size is 45 px on tablet (TC-V-003)', async ({ page }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const fontSize = await headline.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('45px');
    });
  });

  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('headline font-size is 57 px and line-height is 1.1 on desktop (TC-V-004)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const metrics = await headline.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        };
      });

      expect(metrics.fontSize).toBe('57px');
      const fontSizePx = parseFloat(metrics.fontSize);
      const lineHeightPx = parseFloat(metrics.lineHeight);
      expect(lineHeightPx / fontSizePx).toBeCloseTo(1.1, 2);
    });
  });
});
