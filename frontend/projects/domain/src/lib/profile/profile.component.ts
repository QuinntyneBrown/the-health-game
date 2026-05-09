import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, USERS_SERVICE, UserProfile } from 'api';

@Component({
  selector: 'lib-profile',
  imports: [MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(USERS_SERVICE);

  readonly profile = toSignal<UserProfile | undefined>(this.users.getCurrentUser());

  onSignOut(): void {
    this.auth.signOut();
  }
}
