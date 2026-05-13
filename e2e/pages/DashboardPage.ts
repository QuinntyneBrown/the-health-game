import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, '/home', /home|dashboard|today/i);
  }

  async expectOverview(): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByRole('navigation', { name: /primary/i })).toBeVisible();
    await this.expectTextVisible(/next action|today|progress|rewards/i);
  }

  async expectGoalSummary(goalName: string): Promise<void> {
    await expect(this.page.getByText(goalName)).toBeVisible();
  }

  async expectEarnedRewardNotification(rewardName: string): Promise<void> {
    await expect(this.page.getByRole('status').or(this.page.getByText(rewardName))).toContainText(rewardName);
  }
}
