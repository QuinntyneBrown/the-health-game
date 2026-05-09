import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type UserAvatarSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'hg-user-avatar',
  imports: [MatIconModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  readonly imageUrl = input<string | null>(null);
  readonly initials = input('');
  readonly name = input('User');
  readonly size = input<UserAvatarSize>('medium');
}
