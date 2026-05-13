import { Page } from '@playwright/test';

import { ActivityInput, BasePage } from './BasePage';

export class ActivityManagementPage extends BasePage {
  constructor(page: Page) {
    super(page, '/activity/edit', /edit activity|activity edit/i);
  }

  async gotoDelete(): Promise<void> {
    await this.goto('/activity/delete');
  }

  async editActivity(activity: ActivityInput): Promise<void> {
    await this.fillField(/quantity/i, activity.quantity);
    await this.fillField(/notes?/i, activity.notes ?? '');
    await this.clickButton(/save|update/i);
  }

  async deleteActivity(): Promise<void> {
    await this.clickButton(/delete|confirm/i);
  }

  async expectDeletionConfirmation(): Promise<void> {
    await this.expectTextVisible(/delete activity|remove this activity|confirm/i);
  }
}
