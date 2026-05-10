import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'hg-reward-card',
  imports: [ActionButtonComponent, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './reward-card.component.html',
  styleUrl: './reward-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCardComponent {
  readonly actionSelected = output<void>();
  readonly actionLabel = input('');
  readonly description = input('');
  readonly earnedDateLabel = input('');
  readonly icon = input('emoji_events');
  readonly isEarned = input(false);
  readonly name = input.required<string>();
  readonly statusLabel = input('');
  readonly progressCurrent = input<number | null>(null);
  readonly progressTarget = input<number | null>(null);
}
