import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  imports: [MatButtonModule, MatIconModule, MatListModule],
  selector: 'hg-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrl: './activity-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityListItemComponent {
  @Input() title = 'Today 7:40 AM - 24 min';
  @Input() detail = 'Park loop';
  @Input() metaLabel = 'Morning walk';
  @Input() testId = '';
  @Input() editTestId = '';
  @Input() deleteTestId = '';
  @Output() editSelected = new EventEmitter<void>();
  @Output() deleteSelected = new EventEmitter<void>();

}
