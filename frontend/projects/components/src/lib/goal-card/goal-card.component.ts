import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatProgressBarModule],
  selector: 'hg-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardComponent {
  @Input() title = 'Morning walk';
  @Input() description = '30 min daily';
  @Input() cadenceLabel = 'Daily';
  @Input() progressLabel = 'Progress';
  @Input() progressValue = 82;
  @Input() currentStreakLabel = '7 current';
  @Input() longestStreakLabel = '12 best';
  @Input() rewardName = 'Trail breakfast';
  @Input() tone: 'primary' | 'success' | 'accent' | '' = '';
  @Input() actionLabel = 'Open';
  @Output() actionSelected = new EventEmitter<void>();

  get progressPercent(): number { return Math.max(0, Math.min(100, this.progressValue)); }
  get progressStyle(): string { return `inline-size: ${Math.max(0, Math.min(100, this.progressValue))}%`; }

}
