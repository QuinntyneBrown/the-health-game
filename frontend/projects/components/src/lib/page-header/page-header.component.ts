import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hg-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() title = 'Goals';
  @Input() description = '';
  @Input() eyebrow = '';
  @Input() headingId = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Output() actionSelected = new EventEmitter<void>();

}
