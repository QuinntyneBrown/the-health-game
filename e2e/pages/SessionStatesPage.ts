import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class SessionStatesPage extends BasePage {
  constructor(page: Page) {
    super(page, '/auth/callback', /session|signing|signed|expired/i);
  }

  async gotoCallback(code = 'e2e-code', state = 'e2e-state'): Promise<void> {
    await this.page.addInitScript((expectedState) => {
      window.sessionStorage.setItem('hg.oidc.state', expectedState);
      window.sessionStorage.setItem('hg.oidc.verifier', 'e2e-verifier');
    }, state);
    await this.goto(`/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
  }

  async gotoSignedOut(): Promise<void> {
    await this.goto('/auth/signed-out');
  }

  async gotoExpiredTokenState(): Promise<void> {
    await this.goto('/auth/callback?error=login_required&error_description=session_expired');
  }

  async expectCallbackProcessing(): Promise<void> {
    await expect(this.page.getByRole('dialog').or(this.page.getByRole('status'))).toContainText(/signing|session/i);
  }

  async expectSignedOut(): Promise<void> {
    await this.expectTextVisible(/signed out/i);
  }

  async expectExpiredSession(): Promise<void> {
    await this.expectTextVisible(/expired|sign in again|reauthenticate/i);
  }
}
