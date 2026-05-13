import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hg-section-header',
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  @Input() title = 'Today';
  @Input() note = '';
  @Input() headingId = '';

}
