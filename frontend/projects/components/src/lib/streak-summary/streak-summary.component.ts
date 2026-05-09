import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type StreakSummaryTone = 'streak' | 'primary' | 'neutral';

@Component({
  selector: 'hg-streak-summary',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './streak-summary.component.html',
  styleUrl: './streak-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreakSummaryComponent {
  readonly icon = input('local_fire_department');
  readonly label = input('Current streak');
  readonly supportText = input('');
  readonly tone = input<StreakSummaryTone>('streak');
  readonly unit = input('days');
  readonly value = input.required<string | number>();
}
