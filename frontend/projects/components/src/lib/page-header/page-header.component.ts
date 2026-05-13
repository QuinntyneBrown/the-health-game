import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatButtonModule, MatIconModule],
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
