import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppBrandComponent } from '../app-brand/app-brand.component';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'hg-app-top-bar',
  imports: [AppBrandComponent, MatButtonModule, MatIconModule, MatToolbarModule, UserAvatarComponent],
  templateUrl: './app-top-bar.component.html',
  styleUrl: './app-top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTopBarComponent {
  readonly notificationsSelected = output<void>();
  readonly settingsSelected = output<void>();
  readonly avatarInitials = input('');
  readonly avatarName = input('User profile');
  readonly showBrand = input(true);
  readonly title = input('');
}
