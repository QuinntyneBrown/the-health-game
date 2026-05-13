import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

export interface SegmentedFilterOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  imports: [MatButtonToggleModule],
  selector: 'hg-segmented-filter',
  templateUrl: './segmented-filter.component.html',
  styleUrl: './segmented-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedFilterComponent {
  @Input() ariaLabel = 'Filter';
  @Input() options: readonly SegmentedFilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];
  @Input() value = 'all';
  @Output() valueChange = new EventEmitter<string>();

  onSelectionChange(event: MatButtonToggleChange): void {
    if (typeof event.value === 'string') {
      this.valueChange.emit(event.value);
    }
  }

}
