import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'hg-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  @Input() name = 'Quinn';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get initial(): string { return (this.name || '?').trim().charAt(0).toUpperCase(); }

}
