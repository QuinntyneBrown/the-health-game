import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class StatsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/stats', /stats|statistics/i);
  }

  async expectActivityChart(): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByRole('list', { name: /activity chart/i }).or(this.page.locator('[aria-label="Activity chart"]'))).toBeVisible();
  }

  async expectAggregateProgress(goalName: string): Promise<void> {
    await this.expectTextVisible(goalName);
    await this.expectTextVisible(/current|longest|completion|progress/i);
  }
}
