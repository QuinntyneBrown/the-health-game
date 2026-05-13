import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class RewardsListPage extends BasePage {
  constructor(page: Page) {
    super(page, '/rewards', /rewards list|rewards/i);
  }

  async expectRewardVisible(name: string): Promise<void> {
    await expect(this.rewardCard(name)).toBeVisible();
  }

  async expectEarnedReward(name: string, earnedDate: string | RegExp): Promise<void> {
    const card = this.rewardCard(name);
    await expect(card).toContainText(/earned/i);
    await expect(card).toContainText(earnedDate);
  }

  async expectPendingReward(name: string): Promise<void> {
    await expect(this.rewardCard(name)).toContainText(/pending|locked|not earned/i);
  }

  private rewardCard(name: string) {
    return this.testId('reward-list').locator('article, section').filter({ hasText: name });
  }
}
