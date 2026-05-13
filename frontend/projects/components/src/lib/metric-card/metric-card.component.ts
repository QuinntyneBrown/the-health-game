import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input() label = 'Current streak';
  @Input() value = '7 days';
  @Input() tone: 'primary' | 'success' | 'accent' | '' = 'primary';
  @Input() icon = '';
  @Input() supportText = '';
  @Input() progressValue: number | null = null;
  @Input() ariaLabel = '';

}
