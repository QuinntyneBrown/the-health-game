import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'hg-reward-card',
  imports: [
    ActionButtonComponent,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
  ],
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
  readonly progressPercent = computed(() => {
    const cur = this.progressCurrent();
    const tgt = this.progressTarget();
    if (cur === null || tgt === null || tgt <= 0) return 0;
    return Math.min(100, Math.round((cur / tgt) * 100));
  });
  readonly hasProgress = computed(
    () => this.progressCurrent() !== null && this.progressTarget() !== null,
  );
}
