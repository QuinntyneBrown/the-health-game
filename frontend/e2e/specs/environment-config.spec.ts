// Acceptance Test
// Traces to: L2-013, L2-017
// Description: The app reads apiBaseUrl and OIDC config from the environment file.
import { expect, test } from '@playwright/test';

test.describe('Environment configuration', () => {
  test('exposes the configured apiBaseUrl on <body data-api-base-url>', async ({ page }) => {
    await page.goto('/');
    const apiBaseUrl = await page.locator('body').getAttribute('data-api-base-url');
    expect(apiBaseUrl).toBeTruthy();
    expect(apiBaseUrl).toMatch(/^https?:\/\//);
  });

  test('the development build exposes the dev apiBaseUrl', async ({ page }) => {
    await page.goto('/');
    const apiBaseUrl = await page.locator('body').getAttribute('data-api-base-url');
    expect(apiBaseUrl).toBe('http://localhost:5224');
  });
});
