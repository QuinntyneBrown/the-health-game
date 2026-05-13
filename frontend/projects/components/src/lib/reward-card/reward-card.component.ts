import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-reward-card',
  templateUrl: './reward-card.component.html',
  styleUrl: './reward-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCardComponent {
  @Input() name = 'Trail breakfast';
  @Input() description = 'Unlocked by a 7 day Morning walk streak.';
  @Input() statusLabel = 'Ready';
  @Input() earnedDateLabel = '';
  @Input() isEarned = false;
  @Input() icon = '';
  @Input() progressCurrent: number | null = 7;
  @Input() progressTarget: number | null = 7;

  get progressValue(): number {
    if (this.progressCurrent === null || this.progressTarget === null || this.progressTarget <= 0) return this.isEarned ? 100 : 0;
    return Math.round(Math.min(this.progressCurrent / this.progressTarget, 1) * 100);
  }

  get progressStyle(): string { return `inline-size: ${this.progressValue}%`; }

}
