import { Page } from '@playwright/test';

import { BasePage, RewardInput } from './BasePage';

export class RewardFormPage extends BasePage {
  constructor(page: Page) {
    super(page, '/rewards/new', /reward form|new reward|edit reward/i);
  }

  async gotoNew(): Promise<void> {
    await this.goto('/rewards/new');
  }

  async gotoEdit(rewardId: string): Promise<void> {
    await this.goto(`/rewards/${rewardId}/edit`);
  }

  async submitReward(reward: RewardInput): Promise<void> {
    await this.fillField(/name/i, reward.name);
    await this.fillField(/description/i, reward.description ?? '');

    if (reward.goalName) {
      await this.chooseOption(/goal/i, reward.goalName);
    }

    await this.chooseOption(/condition/i, reward.conditionType === 'streak' ? /streak/i : /goal target|target/i);

    if (reward.conditionType === 'streak') {
      await this.fillField(/threshold|streak/i, reward.streakThreshold ?? '');
    }

    await this.clickButton(/save|create reward|update/i);
  }

  async submitRewardWithoutCondition(name: string, description: string): Promise<void> {
    await this.fillField(/name/i, name);
    await this.fillField(/description/i, description);
    await this.clickButton(/save|create reward|update/i);
  }
}
