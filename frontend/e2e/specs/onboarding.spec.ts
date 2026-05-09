// Acceptance Test
// Traces to: 01-TC-V-001
// Description: Onboarding headline ("Make health a game") renders with font family Inter and weight 500.
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
});
