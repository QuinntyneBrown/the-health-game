import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class GoalsEmptyPage extends BasePage {
  constructor(page: Page) {
    super(page, '/goals/empty', /goals empty|goals/i);
  }

  async expectEmptyState(): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByText(/no goals|create a goal|get started/i)).toBeVisible();
    await expect(this.button(/create goal|new goal/i)).toBeVisible();
  }
}
