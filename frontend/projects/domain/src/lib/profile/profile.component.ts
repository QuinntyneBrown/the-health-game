import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent, PageHeaderComponent } from 'components';
import { AuthService, USERS_SERVICE, UserProfile } from 'api';

import {
  DeleteAccountDialogComponent,
  DeleteAccountDialogData,
} from './delete-account-dialog.component';

@Component({
  selector: 'lib-profile',
  imports: [FormsModule, HealthTextFieldComponent, MatButtonModule, PageHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(USERS_SERVICE);
  private readonly dialog = inject(MatDialog);

  readonly profile = signal<UserProfile | undefined>(undefined);
  readonly saving = signal(false);
  readonly emailEditable = computed(() => this.profile()?.emailEditable !== false);
  readonly memberSinceLabel = computed(() => {
    const since = this.profile()?.memberSince;
    if (!since) return null;
    const d = new Date(since);
    if (Number.isNaN(d.valueOf())) return null;
    return `Member since ${d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    })}`;
  });
  readonly editing = signal(false);
  readonly displayName = signal('');
  readonly email = signal('');

  readonly displayNameError = computed(() =>
    this.editing() && this.displayName().trim() === '' ? 'Display name is required' : '',
  );
  readonly emailError = computed(() =>
    this.editing() && !isEmail(this.email()) ? 'Enter a valid email' : '',
  );
  readonly isDirty = computed(() => {
    const current = this.profile();
    if (!current) return false;
    return (
      this.displayName().trim() !== current.displayName.trim() ||
      this.email().trim() !== current.email.trim()
    );
  });

  readonly canSave = computed(
    () =>
      this.isDirty() && this.displayNameError() === '' && this.emailError() === '',
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
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);
    this.users
      .updateCurrentUser({ displayName: this.displayName().trim(), email: this.email().trim() })
      .subscribe({
        next: (updated) => {
          this.profile.set(updated);
          this.editing.set(false);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
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
