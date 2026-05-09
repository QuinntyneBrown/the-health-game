import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

export type WeekStripDayStatus = 'done' | 'today' | 'missed' | 'idle';

export interface WeekStripDay {
  readonly ariaLabel?: string;
  readonly label: string;
  readonly status: WeekStripDayStatus;
}

@Component({
  selector: 'hg-week-strip',
  imports: [MatChipsModule],
  templateUrl: './week-strip.component.html',
  styleUrl: './week-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekStripComponent {
  readonly ariaLabel = input('Weekly progress');
  readonly days = input<readonly WeekStripDay[]>([]);
}
