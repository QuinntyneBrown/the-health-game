import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrl: './activity-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityListItemComponent {
  @Input() title = 'Today 7:40 AM - 24 min';
  @Input() detail = 'Park loop';
  @Input() metaLabel = 'Morning walk';

}
