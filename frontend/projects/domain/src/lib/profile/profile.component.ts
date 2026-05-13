import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfile, UsersService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly profile = signal<UserProfile | null>(null);
  readonly status = signal('Ready');
  displayName = 'E2E User';
  email = 'e2e-user@example.test';

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('Loading profile');
    try {
      const profile = await firstValueFrom(this.usersService.getCurrentUser());
      this.profile.set(profile);
      this.displayName = profile.displayName;
      this.email = profile.email;
      this.status.set('Loaded profile');
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load profile'}`);
    }
  }

  async save(): Promise<void> {
    this.status.set('Saving profile');
    const profile = await firstValueFrom(
      this.usersService.updateCurrentUser({
        displayName: this.displayName,
        email: this.email,
      }),
    );
    this.profile.set(profile);
    this.status.set('Saved profile');
  }

  async deleteAccount(): Promise<void> {
    this.status.set('Deleting account');
    await firstValueFrom(this.usersService.deleteCurrentUser());
    this.profile.set(null);
    this.status.set('Deleted account');
  }
}
