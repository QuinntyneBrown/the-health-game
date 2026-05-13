import { expect, Page } from '@playwright/test';

import { BasePage, GoalInput } from './BasePage';

export class GoalsListPage extends BasePage {
  constructor(page: Page) {
    super(page, '/goals', /goals list|goals/i);
  }

  async createGoal(goal: GoalInput): Promise<void> {
    await this.fillGoalFields(goal);
    await this.clickButton(/create goal/i);
  }

  async expectGoalVisible(name: string): Promise<void> {
    await expect(this.goalCard(name)).toBeVisible();
  }

  async expectGoalAbsent(name: string): Promise<void> {
    await expect(this.goalCard(name)).toHaveCount(0);
  }

  async expectOnlyGoals(goalNames: readonly string[]): Promise<void> {
    for (const goalName of goalNames) {
      await this.expectGoalVisible(goalName);
    }

    const visibleNames = await this.testId('goal-list').locator('article, section').allTextContents();
    expect(visibleNames.join('\n')).not.toMatch(/other user|private goal|unauthorized/i);
  }

  async expectCurrentStreakVisible(goalName: string, expected: number): Promise<void> {
    await expect(this.goalCard(goalName)).toContainText(new RegExp(`${expected}.*(current|streak)`, 'i'));
  }

  async openGoalDetail(goalName: string): Promise<void> {
    await this.goalCard(goalName).getByRole('link', { name: /details|open|view/i }).click();
  }

  async deleteGoal(goalName: string): Promise<void> {
    await this.goalCard(goalName).getByRole('button', { name: /delete/i }).click();
  }

  private async fillGoalFields(goal: GoalInput): Promise<void> {
    await this.fillField(/name/i, goal.name);
    await this.fillField(/description/i, goal.description ?? '');
    await this.fillField(/target/i, goal.targetValue);
    await this.fillField(/unit/i, goal.targetUnit);
    await this.selectCadence(goal);
  }

  private async selectCadence(goal: GoalInput): Promise<void> {
    const cadenceName = goal.cadence === 'custom' ? /custom/i : new RegExp(goal.cadence, 'i');
    await this.page.getByRole('group', { name: /cadence/i }).getByRole('button', { name: cadenceName }).click();

    if (goal.cadence === 'custom') {
      await this.fillField(/every|interval|custom/i, goal.customIntervalValue ?? '1');
      await this.chooseOption(/hours|days|interval unit/i, goal.customIntervalUnit ?? 'days');
    }
  }

  private goalCard(name: string) {
    return this.testId('goal-list').locator('article, section').filter({ hasText: name });
  }
}
