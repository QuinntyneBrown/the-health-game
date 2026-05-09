// Acceptance Test
// Traces to: L2-020, L2-021, L2-030
// Description: Mobile (<768) shows the Material bottom nav and hides the rail/drawer.
import { expect, test } from '@playwright/test';

import { AppShellPage } from '../pages/AppShellPage';

test.describe('Mobile bottom navigation', () => {
  test('shows bottom navigation with Home, Goals, Rewards, Profile', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await expect(shell.bottomNavItem('Home')).toBeVisible();
    await expect(shell.bottomNavItem('Goals')).toBeVisible();
    await expect(shell.bottomNavItem('Rewards')).toBeVisible();
    await expect(shell.bottomNavItem('Profile')).toBeVisible();
  });

  test('shows bottom nav and hides rail and drawer', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    expect(await shell.isBottomNavVisible()).toBe(true);
    expect(await shell.isRailVisible()).toBe(false);
    expect(await shell.isDrawerVisible()).toBe(false);
  });

  test('tapping Goals navigates to /goals', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.gotoHome();

    await shell.clickBottomNavItem('Goals');

    await expect(page).toHaveURL(/\/goals$/);
  });
});
