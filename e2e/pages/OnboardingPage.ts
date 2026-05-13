import { Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  constructor(page: Page) {
    super(page, '/onboarding', /onboarding/i);
  }

  async expectEntryAction(): Promise<void> {
    await this.expectLoaded();
    await this.button(/get started|start|begin|sign in|create account/i).first().waitFor();
  }

  async begin(): Promise<void> {
    await this.clickButton(/get started|start|begin/i);
  }
}
