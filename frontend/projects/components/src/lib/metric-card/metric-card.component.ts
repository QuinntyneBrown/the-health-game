import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
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

  get progressPercent(): number {
    return this.progressValue === null ? 0 : Math.max(0, Math.min(100, this.progressValue));
  }

}
