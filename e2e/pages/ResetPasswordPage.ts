import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class ResetPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page, '/password-reset', /reset password/i);
  }

  async requestReset(email: string): Promise<void> {
    await this.fillField(/email|username/i, email);
    await this.clickButton(/reset|send/i);
  }

  async expectNeutralSuccessMessage(): Promise<void> {
    await expect(this.page.getByRole('status').or(this.page.getByRole('alert'))).toContainText(
      /if an account exists|check your email|instructions/i,
    );
  }
}
