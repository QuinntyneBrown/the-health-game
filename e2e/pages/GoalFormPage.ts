import { Page } from '@playwright/test';

import { BasePage, GoalInput } from './BasePage';

export class GoalFormPage extends BasePage {
  constructor(page: Page) {
    super(page, '/goals/new', /goal form|new goal|edit goal/i);
  }

  async gotoNew(): Promise<void> {
    await this.goto('/goals/new');
  }

  async gotoEdit(goalId: string): Promise<void> {
    await this.goto(`/goals/${goalId}/edit`);
  }

  async submitGoal(goal: GoalInput): Promise<void> {
    await this.fillField(/name/i, goal.name);
    await this.fillField(/description/i, goal.description ?? '');
    await this.fillField(/target/i, goal.targetValue);
    await this.fillField(/unit/i, goal.targetUnit);
    await this.page.getByRole('group', { name: /cadence|filter/i }).getByRole('button', { name: new RegExp(goal.cadence, 'i') }).click();

    if (goal.cadence === 'custom') {
      await this.fillField(/every|interval|custom/i, goal.customIntervalValue ?? '');
      await this.chooseOption(/unit|hours|days/i, goal.customIntervalUnit ?? 'days');
    }

    await this.clickButton(/save|create|update/i);
  }

  async expectCustomCadenceControls(): Promise<void> {
    await this.page.getByRole('group', { name: /cadence|filter/i }).getByRole('button', { name: /custom/i }).click();
    await this.expectTextVisible(/every|hours|days|interval/i);
  }
}
