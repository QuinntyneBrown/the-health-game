import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page, '/profile', /profile/i);
  }

  async updateProfile(displayName: string, email: string): Promise<void> {
    await this.fillField(/display name|name/i, displayName);
    await this.fillField(/email/i, email);
    await this.clickButton(/save|update/i);
  }

  async expectProfile(displayName: string, email: string): Promise<void> {
    await expect(this.page.getByText(displayName)).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
  }

  async signOut(): Promise<void> {
    await this.clickButton(/sign out/i);
  }

  async requestAccountDeletion(): Promise<void> {
    await this.clickButton(/delete account|close account/i);
  }
}
