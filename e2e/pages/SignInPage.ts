import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class SignInPage extends BasePage {
  constructor(page: Page) {
    super(page, '/sign-in', /sign in/i);
  }

  async expectUsernamePasswordForm(): Promise<void> {
    await this.expectLoaded();
    await expect(this.field(/username|email/i)).toBeVisible();
    await expect(this.field(/password/i)).toBeVisible();
    await expect(this.button(/sign in/i)).toBeVisible();
  }

  async signIn(usernameOrEmail: string, password: string): Promise<void> {
    await this.fillField(/username|email/i, usernameOrEmail);
    await this.fillField(/password/i, password);
    await this.clickButton(/sign in/i);
  }

  async expectGenericInvalidCredentialsError(): Promise<void> {
    await this.expectValidationError(/invalid credentials|unable to sign in|username or password/i);
  }

  async expectAuthenticatedRedirect(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(home|goals|profile)/);
  }

  async expectNoSecretConsoleOutput(): Promise<void> {
    const messages: string[] = [];
    this.page.on('console', (message) => messages.push(message.text()));
    await this.page.waitForLoadState('networkidle');
    expect(messages.join('\n')).not.toMatch(/password|access[_-]?token|refresh[_-]?token|reset[_-]?token/i);
  }
}
