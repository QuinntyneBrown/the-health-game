import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export type MetricCardTone = 'primary' | 'reward' | 'streak' | 'neutral';

@Component({
  selector: 'hg-metric-card',
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly ariaLabel = input<string | null>(null);
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly progressValue = input<number | null>(null);
  readonly supportText = input<string>('');
  readonly tone = input<MetricCardTone>('neutral');
  readonly value = input.required<string>();
}
