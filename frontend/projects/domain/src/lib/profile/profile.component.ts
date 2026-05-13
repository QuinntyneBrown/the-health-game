import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { USERS_SERVICE, UserProfile } from 'api';
import {
  ActionButtonComponent,
  HealthTextFieldComponent,
  PageHeaderComponent,
  SectionHeaderComponent,
  StatusBannerComponent,
  UserAvatarComponent,
} from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-profile',
  imports: [
    ActionButtonComponent,
    HealthTextFieldComponent,
    PageHeaderComponent,
    SectionHeaderComponent,
    StatusBannerComponent,
    UserAvatarComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly usersService = inject(USERS_SERVICE);

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
