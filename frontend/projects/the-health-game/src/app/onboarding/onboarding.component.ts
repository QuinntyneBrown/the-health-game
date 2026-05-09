import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  template: `
    <main class="onboarding" data-testid="onboarding">
      <span class="onboarding__wordmark" data-testid="onboarding-wordmark">HealthQuest</span>
      <h1 class="onboarding__headline" data-testid="onboarding-headline">
        Make health a game
      </h1>
      <p class="onboarding__description" data-testid="onboarding-description">
        Build streaks with goals, activity, and personal rewards.
      </p>
      <button
        class="onboarding__primary"
        type="button"
        data-testid="onboarding-get-started"
      >
        Get started
      </button>
      <button
        class="onboarding__secondary"
        type="button"
        data-testid="onboarding-have-account"
      >
        I have an account
      </button>
    </main>
  `,
  styles: [
    `
      .onboarding {
        display: grid;
        gap: 24px;
        padding: 24px;
      }

      .onboarding__wordmark {
        display: none;
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 22px;
        font-weight: 500;
      }

      .onboarding__headline {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 500;
        font-size: 28px;
        margin: 0;
      }

      .onboarding__description {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 400;
        line-height: 1.5;
        font-size: 16px;
        margin: 0;
      }

      .onboarding__primary {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        background: #006d3f;
        border: 0;
        border-radius: 9999px;
        padding: 12px 24px;
        cursor: pointer;
        justify-self: start;
      }

      .onboarding__secondary {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #191d17;
        background: transparent;
        border: 1px solid #c2c9be;
        border-radius: 9999px;
        padding: 12px 24px;
        cursor: pointer;
        justify-self: start;
      }

      @media (min-width: 768px) {
        .onboarding__headline {
          font-size: 45px;
        }

        .onboarding__description {
          font-size: 18px;
        }

        .onboarding__primary,
        .onboarding__secondary {
          font-size: 16px;
        }
      }

      @media (min-width: 1200px) {
        .onboarding__headline {
          font-size: 57px;
          line-height: 1.1;
        }

        .onboarding__wordmark {
          display: block;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {}
