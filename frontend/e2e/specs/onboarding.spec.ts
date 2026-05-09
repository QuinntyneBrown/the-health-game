// Acceptance Test
// Traces to: 01-TC-V-001..010, 01-TC-C-001..010, 01-TC-L-001..004
// Description: Onboarding headline ("Make health a game") renders with font family Inter weight 500
//              and the design-spec font-size at each breakpoint (mobile = 28 px, tablet = 45 px,
//              desktop = 57 px with line-height 1.1). Body description paragraph renders at
//              font-weight 400.
import { expect, test } from '@playwright/test';

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Cannot parse rgb from: ${value}`);
  }
  const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
  return [parts[0], parts[1], parts[2]];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = (channel: number): number => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const lf = relativeLuminance(parseRgb(fg));
  const lb = relativeLuminance(parseRgb(bg));
  const [light, dark] = lf > lb ? [lf, lb] : [lb, lf];
  return (light + 0.05) / (dark + 0.05);
}

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

  test('headline color is #191D17 (TC-C-004)', async ({ page }) => {
    await page.goto('/onboarding');

    const headline = page.getByTestId('onboarding-headline');
    await expect(headline).toBeVisible();

    const color = await headline.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(25, 29, 23)');
  });

  test('primary button background is #006D3F (TC-C-005)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    const background = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(0, 109, 63)');
  });

  test('primary button label color is #FFFFFF (TC-C-006)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    const color = await button.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('active page-dot background is #006D3F (TC-C-008)', async ({ page }) => {
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const active = dots.locator('[aria-current="step"]');
    await expect(active).toBeVisible();

    const background = await active.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(0, 109, 63)');
  });

  test('text/background contrast meets WCAG AA (TC-C-010)', async ({ page }) => {
    await page.goto('/onboarding');

    const root = page.getByTestId('onboarding');
    const headline = page.getByTestId('onboarding-headline');
    const description = page.getByTestId('onboarding-description');
    const trophy = page.getByTestId('onboarding-trophy');
    const hero = page.getByTestId('onboarding-hero');
    const primary = page.getByTestId('onboarding-get-started');
    const secondary = page.getByTestId('onboarding-have-account');

    const pageBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    const heroBg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    const headlineFg = await headline.evaluate((el) => getComputedStyle(el).color);
    const descriptionFg = await description.evaluate((el) => getComputedStyle(el).color);
    const trophyFg = await trophy.evaluate((el) => getComputedStyle(el).color);
    const primaryFg = await primary.evaluate((el) => getComputedStyle(el).color);
    const primaryBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
    const secondaryFg = await secondary.evaluate((el) => getComputedStyle(el).color);

    // Large text (>= 24 px or >= 18.66 px bold): >= 3:1
    expect(contrastRatio(headlineFg, pageBg)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(trophyFg, heroBg)).toBeGreaterThanOrEqual(3);
    // Normal text: >= 4.5:1
    expect(contrastRatio(descriptionFg, pageBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(primaryFg, primaryBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(secondaryFg, pageBg)).toBeGreaterThanOrEqual(4.5);
  });

  test('inactive page-dot background is #F1F5ED (TC-C-009)', async ({ page }) => {
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const inactive = dots.locator('li:not([aria-current="step"])');
    expect(await inactive.count()).toBeGreaterThan(0);

    const backgrounds = await inactive.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    for (const bg of backgrounds) {
      expect(bg).toBe('rgb(241, 245, 237)');
    }
  });

  test('secondary button border is 1 px #C2C9BE (TC-C-007)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-have-account');
    await expect(button).toBeVisible();

    const border = await button.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        topWidth: style.borderTopWidth,
        rightWidth: style.borderRightWidth,
        bottomWidth: style.borderBottomWidth,
        leftWidth: style.borderLeftWidth,
        color: style.borderTopColor,
      };
    });

    expect(border.topWidth).toBe('1px');
    expect(border.rightWidth).toBe('1px');
    expect(border.bottomWidth).toBe('1px');
    expect(border.leftWidth).toBe('1px');
    expect(border.color).toBe('rgb(194, 201, 190)');
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

    test('vertical gap between hero, title, dots, buttons is 24 px (TC-L-002)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const rowGap = await root.evaluate((el) => getComputedStyle(el).rowGap);
      expect(rowGap).toBe('24px');

      const ids = [
        'onboarding-hero',
        'onboarding-headline',
        'onboarding-description',
        'onboarding-page-dots',
        'onboarding-get-started',
        'onboarding-have-account',
      ];
      const rects = await Promise.all(
        ids.map((id) =>
          page.getByTestId(id).evaluate((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom };
          }),
        ),
      );
      for (let i = 1; i < rects.length; i++) {
        const gap = rects[i].top - rects[i - 1].bottom;
        expect(gap).toBeCloseTo(24, 0);
      }
    });

    test('body padding is 24 px on all sides (TC-L-001)', async ({ page }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const padding = await root.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        };
      });

      expect(padding.top).toBe('24px');
      expect(padding.right).toBe('24px');
      expect(padding.bottom).toBe('24px');
      expect(padding.left).toBe('24px');
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

    test('content vertical gap on tablet is 32 px (TC-L-004)', async ({ page }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const rowGap = await root.evaluate((el) => getComputedStyle(el).rowGap);
      expect(rowGap).toBe('32px');
    });

    test('body padding on tablet is 40 px vertical / 80 px horizontal (TC-L-003)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const padding = await root.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        };
      });

      expect(padding.top).toBe('40px');
      expect(padding.bottom).toBe('40px');
      expect(padding.left).toBe('80px');
      expect(padding.right).toBe('80px');
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
