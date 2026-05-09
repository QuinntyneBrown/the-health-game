import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'hg-page-header',
  imports: [ActionButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly actionSelected = output<void>();
  readonly actionIcon = input<string | null>(null);
  readonly actionLabel = input('');
  readonly description = input('');
  readonly eyebrow = input('');
  readonly headingId = input<string | null>(null);
  readonly title = input.required<string>();
}
