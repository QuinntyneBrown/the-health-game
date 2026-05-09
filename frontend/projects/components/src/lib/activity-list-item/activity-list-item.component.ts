import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'hg-activity-list-item',
  imports: [MatChipsModule, MatIconModule, MatListModule],
  templateUrl: './activity-list-item.component.html',
  styleUrl: './activity-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityListItemComponent {
  readonly detail = input('');
  readonly icon = input('check_circle');
  readonly metaLabel = input('');
  readonly quantityLabel = input('');
  readonly statusLabel = input('');
  readonly title = input.required<string>();
}
