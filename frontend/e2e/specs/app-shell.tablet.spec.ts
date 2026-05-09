// Acceptance Test
// Traces to: L2-020, L2-021, L2-030
// Description: Tablet (768–1199) shows the rail and hides bottom nav and drawer.
import { expect, test } from '@playwright/test';

import { AppShellPage } from '../pages/AppShellPage';

test.use({ viewport: { width: 1024, height: 768 } });

test.describe('Tablet rail navigation', () => {
  test('shows the rail with the four primary nav items', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await expect(shell.rail()).toBeVisible();
    await expect(shell.railItem('Home')).toBeVisible();
    await expect(shell.railItem('Goals')).toBeVisible();
    await expect(shell.railItem('Rewards')).toBeVisible();
    await expect(shell.railItem('Profile')).toBeVisible();
  });

  test('hides the bottom nav and drawer', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    expect(await shell.isRailVisible()).toBe(true);
    expect(await shell.isBottomNavVisible()).toBe(false);
    expect(await shell.isDrawerVisible()).toBe(false);
  });

  test('clicking rail Goals navigates to /goals', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await shell.clickRailItem('Goals');

    await expect(page).toHaveURL(/\/goals$/);
  });
});
