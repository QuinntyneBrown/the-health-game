import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SegmentedFilterOption {
  readonly value: string;
  readonly label: string;
}

@Component({
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

}
