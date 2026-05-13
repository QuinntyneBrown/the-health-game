import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export interface CreateAccountInput {
  readonly displayName: string;
  readonly email: string;
  readonly username: string;
  readonly password: string;
}

export class CreateAccountPage extends BasePage {
  constructor(page: Page) {
    super(page, '/register', /create account|register/i);
  }

  async register(input: CreateAccountInput): Promise<void> {
    await this.fillField(/display name|name/i, input.displayName);
    await this.fillField(/email/i, input.email);
    await this.fillField(/username/i, input.username);
    await this.fillField(/^password$/i, input.password);
    await this.clickButton(/create account|register/i);
  }

  async expectAuthenticatedSession(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(home|onboarding|goals|profile)/);
    await this.expectTextVisible(/welcome|today|goals|profile/i);
  }
}
