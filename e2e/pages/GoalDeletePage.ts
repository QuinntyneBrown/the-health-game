import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class GoalDeletePage extends BasePage {
  constructor(page: Page, goalId = 'morning-walk') {
    super(page, `/goals/${goalId}/delete`, /delete goal/i);
  }

  async gotoGoal(goalId: string): Promise<void> {
    await this.goto(`/goals/${goalId}/delete`);
  }

  async expectExplicitConfirmationRequired(goalName: string): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByRole('dialog').or(this.page.getByText(goalName))).toContainText(goalName);
    await expect(this.button(/delete|confirm/i)).toBeDisabled();
  }

  async confirm(goalName: string): Promise<void> {
    await this.fillField(/type|confirm|goal name/i, goalName);
    await this.clickButton(/delete|confirm/i);
  }
}
