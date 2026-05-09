import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';
import { AuthService, USERS_SERVICE, UserProfile } from 'api';

import {
  DeleteAccountDialogComponent,
  DeleteAccountDialogData,
} from './delete-account-dialog.component';

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
  private readonly dialog = inject(MatDialog);

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

  async onDeleteAccount(): Promise<void> {
    const current = this.profile();
    if (!current) return;
    const ref = this.dialog.open<
      DeleteAccountDialogComponent,
      DeleteAccountDialogData,
      boolean
    >(DeleteAccountDialogComponent, { data: { email: current.email } });
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;
    await firstValueFrom(this.users.deleteCurrentUser());
    this.auth.signOut();
  }

  onSignOut(): void {
    this.auth.signOut();
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
