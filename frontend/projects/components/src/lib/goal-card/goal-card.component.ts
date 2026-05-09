import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActionButtonComponent } from '../action-button/action-button.component';

export type GoalCardTone = 'default' | 'complete' | 'streak';

@Component({
  selector: 'hg-goal-card',
  imports: [ActionButtonComponent, MatCardModule, MatChipsModule, MatIconModule, MatProgressBarModule],
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardComponent {
  readonly actionSelected = output<void>();
  readonly actionLabel = input('');
  readonly cadenceLabel = input('');
  readonly currentStreakLabel = input('');
  readonly description = input('');
  readonly icon = input('flag');
  readonly longestStreakLabel = input('');
  readonly progressLabel = input('');
  readonly progressValue = input(0);
  readonly rewardName = input('');
  readonly title = input.required<string>();
  readonly tone = input<GoalCardTone>('default');
}
