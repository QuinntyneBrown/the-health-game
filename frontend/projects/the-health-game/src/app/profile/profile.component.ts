import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'api';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule],
  template: `
    <section class="profile">
      <h1>Profile</h1>
      <button mat-flat-button type="button" (click)="onSignOut()">Sign out</button>
    </section>
  `,
  styles: [
    `
      .profile {
        display: grid;
        gap: var(--hg-space-4);
        padding: var(--hg-space-6);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  onSignOut(): void {
    this.auth.signOut();
  }
}
