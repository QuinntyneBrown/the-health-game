import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from 'api';

@Component({
  selector: 'app-onboarding',
  template: `
    <main class="onboarding" data-testid="onboarding">
      <span class="onboarding__wordmark" data-testid="onboarding-wordmark">HealthQuest</span>
      <div
        class="onboarding__hero"
        data-testid="onboarding-hero"
        aria-hidden="true"
      >
        <span
          class="onboarding__trophy material-symbols-rounded"
          data-testid="onboarding-trophy"
          >emoji_events</span
        >
      </div>
      <h1 class="onboarding__headline" data-testid="onboarding-headline">
        Make health a game
      </h1>
      <p class="onboarding__description" data-testid="onboarding-description">
        Build streaks with goals, activity, and personal rewards.
      </p>
      <ol
        class="onboarding__dots"
        data-testid="onboarding-page-dots"
        aria-label="Onboarding step"
      >
        <li class="onboarding__dot onboarding__dot--active" aria-current="step"></li>
        <li class="onboarding__dot"></li>
        <li class="onboarding__dot"></li>
      </ol>
      <div class="onboarding__buttons" data-testid="onboarding-buttons">
        <button
          class="onboarding__primary"
          type="button"
          data-testid="onboarding-get-started"
          (click)="onGetStarted()"
        >
          Get started
        </button>
        <button
          class="onboarding__secondary"
          type="button"
          data-testid="onboarding-have-account"
          (click)="onHaveAccount()"
        >
          I have an account
        </button>
      </div>
    </main>
  `,
  styles: [
    `
      .onboarding {
        background-color: #f7fbf3;
        display: grid;
        gap: 24px;
        padding: 24px;
        min-height: 100%;
      }

      .onboarding__wordmark {
        display: none;
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 22px;
        font-weight: 500;
      }

      .onboarding__hero {
        background-color: #94f7b4;
        border-radius: 28px;
        min-height: 200px;
        display: grid;
        place-items: center;
      }

      .onboarding__trophy {
        color: #00210f;
        font-family: 'Material Symbols Rounded';
        font-size: 120px;
        line-height: 1;
      }

      .onboarding__headline {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 500;
        font-size: 28px;
        color: #191d17;
        margin: 0;
      }

      .onboarding__description {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-weight: 400;
        line-height: 1.5;
        font-size: 16px;
        margin: 0;
      }

      .onboarding__dots {
        display: flex;
        gap: 8px;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .onboarding__dot {
        background-color: #f1f5ed;
        border-radius: 9999px;
        height: 8px;
        width: 8px;
      }

      .onboarding__dot--active {
        background-color: #006d3f;
      }

      .onboarding__buttons {
        display: grid;
        gap: 12px;
        justify-items: start;
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
        .onboarding {
          gap: 32px;
          padding: 40px 80px;
        }

        .onboarding__hero {
          border-radius: 36px;
        }

        .onboarding__trophy {
          font-size: 180px;
        }

        .onboarding__buttons {
          grid-auto-flow: column;
          gap: 16px;
          justify-content: start;
        }

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
        .onboarding {
          grid-template-columns: 1fr 1fr;
          column-gap: 64px;
          align-items: start;
        }

        .onboarding__wordmark {
          display: block;
          grid-column: 1;
        }

        .onboarding__hero {
          grid-column: 2;
          grid-row: 1 / -1;
          align-self: stretch;
        }

        .onboarding__headline,
        .onboarding__description,
        .onboarding__dots,
        .onboarding__buttons {
          grid-column: 1;
        }

        .onboarding__headline {
          font-size: 57px;
          line-height: 1.1;
        }

        .onboarding__trophy {
          font-size: 280px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  private readonly auth = inject(AuthService);

  onGetStarted(): void {
    void this.auth.signIn('/home');
  }

  onHaveAccount(): void {
    void this.auth.signIn('/home', { prompt: 'login' });
  }
}
