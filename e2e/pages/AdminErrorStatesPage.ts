import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class AdminErrorStatesPage extends BasePage {
  constructor(page: Page) {
    super(page, '/admin', /admin|states|error/i);
  }

  async expectAdminControlsHiddenForUser(): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByRole('button', { name: /admin|delete user|role change/i })).toHaveCount(0);
  }

  async expectStructuredErrorState(): Promise<void> {
    await this.expectTextVisible(/error|try again|correlation/i);
    await expect(this.button(/retry|try again/i)).toBeVisible();
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.page.getByText(/loading|skeleton/i)).toBeVisible();
  }
}
