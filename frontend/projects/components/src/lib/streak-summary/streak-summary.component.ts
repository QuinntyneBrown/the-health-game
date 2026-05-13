import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatCardModule, MatIconModule],
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

  get iconName(): string { return this.tone === 'accent' ? 'emoji_events' : 'local_fire_department'; }

}
