import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'hg-empty-state',
  imports: [ActionButtonComponent, MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly actionSelected = output<void>();
  readonly actionIcon = input<string | null>(null);
  readonly actionLabel = input('');
  readonly description = input('');
  readonly icon = input('flag');
  readonly title = input.required<string>();
}
