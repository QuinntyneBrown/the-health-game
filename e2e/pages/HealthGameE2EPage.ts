import { expect, Locator, Page } from '@playwright/test';

export class HealthGameE2EPage {
  constructor(private readonly page: Page) {}

  async authenticateAs(userId: string): Promise<void> {
    await this.page.addInitScript((token) => {
      window.sessionStorage.setItem('hg.oidc.access-token', token);
    }, `e2e-${userId}`);
  }

  async gotoProfile(): Promise<void> {
    await this.page.goto('/profile');
    await expect(this.page.getByTestId('profile-status')).toContainText(/Loaded|Saved|Ready/);
  }

  async saveProfile(displayName: string, email: string): Promise<void> {
    await this.page.getByTestId('profile-name').fill(displayName);
    await this.page.getByTestId('profile-email').fill(email);
    await this.page.getByTestId('save-profile').click();
    await expect(this.page.getByTestId('profile-status')).toHaveText('Saved profile');
    await expect(this.page.getByTestId('profile-display')).toHaveText(displayName);
  }

  async deleteAccount(): Promise<void> {
    await this.page.getByTestId('delete-account').click();
    await expect(this.page.getByTestId('profile-status')).toHaveText('Deleted account');
  }

  async gotoGoals(): Promise<void> {
    await this.page.goto('/goals');
    await expect(this.page.getByTestId('goals-status')).toContainText(/Loaded|Ready/);
  }

  async createGoal(name: string, description: string, target: string, unit: string): Promise<void> {
    await this.page.getByTestId('goal-name').fill(name);
    await this.page.getByTestId('goal-description').fill(description);
    await this.page.getByTestId('goal-target').fill(target);
    await this.page.getByTestId('goal-unit').fill(unit);
    await this.page.getByTestId('goal-cadence').selectOption('daily');
    await this.page.getByTestId('create-goal').click();
    await expect(this.goalCardByName(name)).toBeVisible();
  }

  async updateGoal(goalId: string, updatedName: string): Promise<void> {
    await this.page.getByTestId(`edit-goal-name-${goalId}`).fill(updatedName);
    await this.page.getByTestId(`update-goal-${goalId}`).click();
    await expect(this.goalCardByName(updatedName)).toBeVisible();
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.page.getByTestId(`delete-goal-${goalId}`).click();
    await expect(this.page.getByTestId(`goal-card-${goalId}`)).toHaveCount(0);
  }

  async logActivity(goalId: string, quantity: string, notes: string): Promise<void> {
    await this.page.getByTestId('activity-quantity').fill(quantity);
    await this.page.getByTestId('activity-notes').fill(notes);
    await this.page.getByTestId(`log-activity-${goalId}`).click();
    await expect(this.page.getByTestId('goals-status')).toHaveText(/Logged activity/);
  }

  async updateActivity(activityId: string): Promise<void> {
    await this.page.getByTestId(`update-activity-${activityId}`).click();
    await expect(this.page.getByTestId('goals-status')).toHaveText('Updated activity');
  }

  async deleteActivity(activityId: string): Promise<void> {
    await this.page.getByTestId(`delete-activity-${activityId}`).click();
    await expect(this.page.getByTestId('goals-status')).toHaveText('Deleted activity');
  }

  async createReward(goalId: string, rewardName: string): Promise<void> {
    await this.page.getByTestId('reward-name').fill(rewardName);
    await this.page.getByTestId(`create-reward-${goalId}`).click();
    await expect(this.page.getByTestId(`goal-rewards-${goalId}`)).toContainText(rewardName);
  }

  async gotoRewards(): Promise<void> {
    await this.page.goto('/rewards');
    await expect(this.page.getByTestId('rewards-status')).toContainText(/Loaded|Ready/);
  }

  rewardCardByName(name: string): Locator {
    return this.page.getByTestId('reward-list').locator('article').filter({ hasText: name });
  }

  private goalCardByName(name: string): Locator {
    return this.page.getByTestId('goal-list').locator('article').filter({ hasText: name });
  }
}
