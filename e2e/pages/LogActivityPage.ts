import { expect, Page } from '@playwright/test';

import { ActivityInput, BasePage } from './BasePage';

export class LogActivityPage extends BasePage {
  constructor(page: Page) {
    super(page, '/activity/log', /log activity/i);
  }

  async gotoDialog(): Promise<void> {
    await this.goto('/activity/log-dialog');
  }

  async logActivity(activity: ActivityInput): Promise<void> {
    await this.fillField(/quantity/i, activity.quantity);

    if (activity.recordedAt) {
      await this.fillField(/time|date|recorded/i, activity.recordedAt);
    }

    await this.fillField(/notes?/i, activity.notes ?? '');
    await this.clickButton(/log|save/i);
  }

  async expectDiscardChangesPrompt(): Promise<void> {
    await this.fillField(/quantity/i, '1');
    await this.clickButton(/close|cancel/i);
    await expect(this.page.getByRole('dialog')).toContainText(/discard changes/i);
  }
}
