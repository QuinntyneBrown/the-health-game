// Acceptance Test
// Traces to: L2-020, L2-021, L2-030
// Description: Desktop (>=1200) shows the labeled drawer; bottom nav and rail are hidden.
import { expect, test } from '@playwright/test';

import { AppShellPage } from '../pages/AppShellPage';

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Desktop drawer navigation', () => {
  test('shows the drawer with icon + label for each primary destination', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await expect(shell.drawer()).toBeVisible();
    for (const label of ['Home', 'Goals', 'Rewards', 'Profile']) {
      await expect(shell.drawerItem(label)).toBeVisible();
      await expect(shell.drawerItem(label)).toContainText(label);
    }
  });

  test('hides the bottom nav and rail', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    expect(await shell.isDrawerVisible()).toBe(true);
    expect(await shell.isBottomNavVisible()).toBe(false);
    expect(await shell.isRailVisible()).toBe(false);
  });

  test('clicking drawer Rewards navigates to /rewards', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await shell.clickDrawerItem('Rewards');

    await expect(page).toHaveURL(/\/rewards$/);
  });

  test('main content is bounded by --hg-size-content-max', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    const main = page.locator('.app-shell__main');
    const maxPx = await main.evaluate((el) => {
      const max = getComputedStyle(el).maxWidth;
      return max === 'none' ? Number.POSITIVE_INFINITY : parseFloat(max);
    });

    // 72rem at 16px root => 1152px
    expect(maxPx).toBeLessThanOrEqual(1152);
  });
});
