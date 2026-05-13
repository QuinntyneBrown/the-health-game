import { Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class AccountDeletePage extends BasePage {
  constructor(page: Page) {
    super(page, '/account/delete', /delete account/i);
  }

  async confirmDeletion(email: string): Promise<void> {
    await this.fillField(/email|confirm/i, email);
    await this.clickButton(/delete account|confirm/i);
  }
}
