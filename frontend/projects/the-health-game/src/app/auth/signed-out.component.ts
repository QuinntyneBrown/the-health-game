import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-signed-out',
  template: `
    <section class="signed-out">
      <h1>You are signed out</h1>
      <p>Sign in again to keep tracking your goals.</p>
    </section>
  `,
  styles: [
    `
      .signed-out {
        padding: var(--hg-space-6);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignedOutComponent {}
