import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ActionButtonComponent } from '../action-button/action-button.component';

export type StatusBannerTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'hg-status-banner',
  imports: [ActionButtonComponent, MatCardModule, MatIconModule],
  templateUrl: './status-banner.component.html',
  styleUrl: './status-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBannerComponent {
  readonly actionSelected = output<void>();
  readonly dismissed = output<void>();
  readonly actionLabel = input('');
  readonly dismissLabel = input('');
  readonly icon = input('info');
  readonly message = input.required<string>();
  readonly tone = input<StatusBannerTone>('info');
}
