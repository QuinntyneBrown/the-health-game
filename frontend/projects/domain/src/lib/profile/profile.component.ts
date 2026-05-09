import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HealthTextFieldComponent } from 'components';
import { AuthService, USERS_SERVICE, UserProfile } from 'api';

@Component({
  selector: 'lib-profile',
  imports: [HealthTextFieldComponent, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(USERS_SERVICE);

  readonly profile = signal<UserProfile | undefined>(undefined);
  readonly editing = signal(false);
  readonly displayName = signal('');
  readonly email = signal('');

  readonly displayNameError = computed(() =>
    this.editing() && this.displayName().trim() === '' ? 'Display name is required' : '',
  );
  readonly emailError = computed(() =>
    this.editing() && !isEmail(this.email()) ? 'Enter a valid email' : '',
  );
  readonly canSave = computed(
    () => this.displayNameError() === '' && this.emailError() === '',
  );

  constructor() {
    this.users.getCurrentUser().subscribe((user) => this.profile.set(user));
  }

  startEdit(): void {
    const current = this.profile();
    if (!current) return;
    this.displayName.set(current.displayName);
    this.email.set(current.email);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  save(): void {
    if (!this.canSave()) return;
    this.users
      .updateCurrentUser({ displayName: this.displayName().trim(), email: this.email().trim() })
      .subscribe((updated) => {
        this.profile.set(updated);
        this.editing.set(false);
      });
  }

  onSignOut(): void {
    this.auth.signOut();
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
