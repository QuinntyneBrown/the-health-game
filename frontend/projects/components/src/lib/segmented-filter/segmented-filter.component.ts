import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

export interface SegmentedFilterOption {
  readonly disabled?: boolean;
  readonly icon?: string;
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'hg-segmented-filter',
  imports: [MatButtonToggleModule, MatIconModule],
  templateUrl: './segmented-filter.component.html',
  styleUrl: './segmented-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedFilterComponent {
  readonly valueChange = output<string>();
  readonly ariaLabel = input('Filter options');
  readonly options = input<readonly SegmentedFilterOption[]>([]);
  readonly value = input<string | null>(null);

  onValueChange(event: MatButtonToggleChange): void {
    this.valueChange.emit(String(event.value));
  }
}
