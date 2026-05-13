import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatCardModule, MatIconModule],
  selector: 'hg-status-banner',
  templateUrl: './status-banner.component.html',
  styleUrl: './status-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBannerComponent {
  @Input() message = 'Offline snapshot ready. The next sync will merge new entries.';
  @Input() tone: 'info' | 'success' | 'error' = 'info';

  get iconName(): string {
    if (this.tone === 'success') return 'check_circle';
    if (this.tone === 'error') return 'error';
    return 'info';
  }

}
