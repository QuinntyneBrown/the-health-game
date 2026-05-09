import { Locator, Page } from '@playwright/test';

export class AppShellPage {
  constructor(private readonly page: Page) {}

  async gotoHome(): Promise<void> {
    await this.page.goto('/');
  }

  bottomNavigation(): Locator {
    return this.page.locator('hg-navigation-bar.app-shell__navigation--bottom');
  }

  bottomNavItem(label: string): Locator {
    return this.bottomNavigation().getByRole('button', { name: label });
  }

  rail(): Locator {
    return this.page.locator('hg-navigation-bar.app-shell__navigation--rail');
  }

  railItem(label: string): Locator {
    return this.rail().getByRole('button', { name: label });
  }

  drawer(): Locator {
    return this.page.locator('hg-navigation-bar.app-shell__navigation--drawer');
  }

  drawerItem(label: string): Locator {
    return this.drawer().getByRole('button', { name: label });
  }

  async isBottomNavVisible(): Promise<boolean> {
    return this.bottomNavigation().isVisible();
  }

  async isRailVisible(): Promise<boolean> {
    return this.rail().isVisible();
  }

  async isDrawerVisible(): Promise<boolean> {
    return this.drawer().isVisible();
  }

  async clickBottomNavItem(label: string): Promise<void> {
    await this.bottomNavItem(label).click();
  }

  async clickRailItem(label: string): Promise<void> {
    await this.railItem(label).click();
  }

  async clickDrawerItem(label: string): Promise<void> {
    await this.drawerItem(label).click();
  }
}
