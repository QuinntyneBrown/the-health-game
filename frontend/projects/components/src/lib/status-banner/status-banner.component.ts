import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-status-banner',
  templateUrl: './status-banner.component.html',
  styleUrl: './status-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBannerComponent {
  @Input() message = 'Offline snapshot ready. The next sync will merge new entries.';
  @Input() tone: 'info' | 'success' | 'error' = 'info';

}
