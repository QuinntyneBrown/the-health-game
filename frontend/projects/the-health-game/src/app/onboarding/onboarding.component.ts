import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  template: `
    <main class="onboarding" data-testid="onboarding">
      <h1 class="onboarding__headline" data-testid="onboarding-headline">
        Make health a game
      </h1>
      <p class="onboarding__description">
        Build streaks with goals, activity, and personal rewards.
      </p>
    </main>
  `,
  styles: [
    `
      .onboarding {
        display: grid;
        gap: 24px;
        padding: 24px;
      }

      .onboarding__headline {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 500;
        font-size: 28px;
        margin: 0;
      }

      @media (min-width: 768px) {
        .onboarding__headline {
          font-size: 45px;
        }
      }

      @media (min-width: 1200px) {
        .onboarding__headline {
          font-size: 57px;
          line-height: 1.1;
        }
      }

      .onboarding__description {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 400;
        line-height: 1.5;
        font-size: 16px;
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {}
