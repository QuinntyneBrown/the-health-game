import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface WeekStripDay {
  readonly label: string;
  readonly status: 'complete' | 'today' | 'next';
}

@Component({
  imports: [MatCardModule, MatIconModule],
  selector: 'hg-week-strip',
  templateUrl: './week-strip.component.html',
  styleUrl: './week-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekStripComponent {
  @Input() days: readonly WeekStripDay[] = [
    { label: 'Mon', status: 'complete' },
    { label: 'Tue', status: 'complete' },
    { label: 'Wed', status: 'complete' },
    { label: 'Thu', status: 'complete' },
    { label: 'Fri', status: 'today' },
    { label: 'Sat', status: 'next' },
    { label: 'Sun', status: 'next' },
  ];

  getStatusLabel(day: WeekStripDay): string {
    if (day.status === 'complete') return 'Done';
    if (day.status === 'today') return 'Today';
    return 'Next';
  }

  getStatusIcon(day: WeekStripDay): string {
    if (day.status === 'complete') return 'check_circle';
    if (day.status === 'today') return 'radio_button_checked';
    return 'radio_button_unchecked';
  }

}
