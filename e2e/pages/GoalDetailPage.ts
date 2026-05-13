import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class GoalDetailPage extends BasePage {
  constructor(page: Page, goalIdOrSlug = 'morning-walk') {
    super(page, `/goals/${goalIdOrSlug}`, /goal detail|goal/i);
  }

  async gotoGoal(goalIdOrSlug: string): Promise<void> {
    await this.goto(`/goals/${goalIdOrSlug}`);
  }

  async expectGoalSummary(summary: {
    readonly name: string;
    readonly description: string;
    readonly target: string | RegExp;
    readonly cadence: string | RegExp;
    readonly currentStreak: number;
    readonly longestStreak: number;
  }): Promise<void> {
    await this.expectLoaded();
    await this.expectTextVisible(summary.name);
    await this.expectTextVisible(summary.description);
    await this.expectTextVisible(summary.target);
    await this.expectTextVisible(summary.cadence);
    await this.expectTextVisible(new RegExp(`${summary.currentStreak}.*current`, 'i'));
    await this.expectTextVisible(new RegExp(`${summary.longestStreak}.*(longest|best)`, 'i'));
  }

  async expectActivityHistoryOrdered(notesInOrder: readonly string[]): Promise<void> {
    const history = this.page.getByRole('region', { name: /activity history/i }).or(this.page.locator('[aria-label="Activity history"]'));
    await expect(history).toBeVisible();
    const text = await history.textContent();
    let previousIndex = -1;

    for (const note of notesInOrder) {
      const index = text?.indexOf(note) ?? -1;
      expect(index, `${note} not found in activity history`).toBeGreaterThan(previousIndex);
      previousIndex = index;
    }
  }

  async expectRewardVisible(rewardName: string): Promise<void> {
    await this.expectTextVisible(rewardName);
  }
}
