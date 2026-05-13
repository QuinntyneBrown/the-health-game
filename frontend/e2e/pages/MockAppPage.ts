import { expect, Locator, Page } from '@playwright/test';

export class MockAppPage {
  constructor(private readonly page: Page) {}

  async goto(route: string): Promise<void> {
    await this.page.goto(route);
  }

  screen(id: string): Locator {
    return this.page.locator(`[data-screen="${id}"]`);
  }

  async expectScreen(id: string, title: string): Promise<void> {
    const screen = this.screen(id);
    await expect(screen).toBeVisible();
    await expect(screen.locator(`#${id}-title`)).toHaveText(title);
  }

  appShellToolbar(): Locator {
    return this.page.locator('.app-shell__toolbar');
  }
}
