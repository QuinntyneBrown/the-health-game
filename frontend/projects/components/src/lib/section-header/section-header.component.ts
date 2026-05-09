import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hg-section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly headingId = input<string | null>(null);
  readonly note = input('');
  readonly title = input.required<string>();
}
