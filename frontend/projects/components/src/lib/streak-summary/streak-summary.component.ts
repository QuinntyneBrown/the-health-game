import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-streak-summary',
  templateUrl: './streak-summary.component.html',
  styleUrl: './streak-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreakSummaryComponent {
  @Input() label = 'Current streak';
  @Input() value: string | number = 7;
  @Input() unit = 'days';
  @Input() tone: 'primary' | 'streak' | 'accent' = 'primary';

}
