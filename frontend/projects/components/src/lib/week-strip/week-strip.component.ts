import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface WeekStripDay {
  readonly label: string;
  readonly status: 'complete' | 'today' | 'next';
}

@Component({
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

}
