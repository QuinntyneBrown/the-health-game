// Acceptance Test
// Traces to: 01-TC-V-001..010, 01-TC-C-001, 01-TC-C-002, 01-TC-C-003
// Description: Onboarding headline ("Make health a game") renders with font family Inter weight 500
//              and the design-spec font-size at each breakpoint (mobile = 28 px, tablet = 45 px,
//              desktop = 57 px with line-height 1.1). Body description paragraph renders at
//              font-weight 400.
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

  test('body description font-weight is 400 (TC-V-005)', async ({ page }) => {
    await page.goto('/onboarding');

    const description = page.getByTestId('onboarding-description');
    await expect(description).toBeVisible();

    const fontWeight = await description.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe('400');
  });

  test('page background is #F7FBF3 (TC-C-001)', async ({ page }) => {
    await page.goto('/onboarding');

    const root = page.getByTestId('onboarding');
    await expect(root).toBeVisible();

    const background = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(247, 251, 243)');
  });

  test('hero panel background is #94F7B4 (TC-C-002)', async ({ page }) => {
    await page.goto('/onboarding');

    const hero = page.getByTestId('onboarding-hero');
    await expect(hero).toBeVisible();

    const background = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(148, 247, 180)');
  });

  test('trophy icon color on hero is #00210F (TC-C-003)', async ({ page }) => {
    await page.goto('/onboarding');

    const trophy = page.getByTestId('onboarding-trophy');
    await expect(trophy).toBeVisible();

    const color = await trophy.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(0, 33, 15)');
  });

  test('body description line-height ratio is 1.5 (TC-V-007)', async ({ page }) => {
    await page.goto('/onboarding');

    const description = page.getByTestId('onboarding-description');
    await expect(description).toBeVisible();

    const metrics = await description.evaluate((el) => {
      const style = getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    const fontSizePx = parseFloat(metrics.fontSize);
    const lineHeightPx = parseFloat(metrics.lineHeight);
    expect(lineHeightPx / fontSizePx).toBeCloseTo(1.5, 2);
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

    test('description font-size is 16 px on mobile (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('16px');
    });

    test('"Get started" button typography on mobile (TC-V-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-get-started');
      await expect(button).toBeVisible();
      await expect(button).toHaveText('Get started');

      const computed = await button.evaluate((el) => {
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

    test('"I have an account" button typography on mobile (TC-V-009)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-have-account');
      await expect(button).toBeVisible();
      await expect(button).toHaveText('I have an account');

      const computed = await button.evaluate((el) => {
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
      expect(computed.color).toBe('rgb(25, 29, 23)');
    });

    test('brand wordmark is hidden on mobile (TC-V-010)', async ({ page }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeHidden();
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

    test('description font-size is 18 px on tablet (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('18px');
    });

    test('"Get started" button typography on tablet (TC-V-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-get-started');
      await expect(button).toBeVisible();

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontWeight: style.fontWeight, fontSize: style.fontSize, color: style.color };
      });

      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('16px');
      expect(computed.color).toBe('rgb(255, 255, 255)');
    });

    test('"I have an account" button typography on tablet (TC-V-009)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-have-account');
      await expect(button).toBeVisible();

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontWeight: style.fontWeight, fontSize: style.fontSize, color: style.color };
      });

      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('16px');
      expect(computed.color).toBe('rgb(25, 29, 23)');
    });

    test('brand wordmark is hidden on tablet (TC-V-010)', async ({ page }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeHidden();
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

    test('description font-size is 18 px on desktop (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('18px');
    });

    test('brand wordmark "HealthQuest" is visible on desktop with font 22 px weight 500 (TC-V-010)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeVisible();
      await expect(wordmark).toHaveText('HealthQuest');

      const computed = await wordmark.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontSize: style.fontSize, fontWeight: style.fontWeight };
      });

      expect(computed.fontSize).toBe('22px');
      expect(computed.fontWeight).toBe('500');
    });
  });
});
