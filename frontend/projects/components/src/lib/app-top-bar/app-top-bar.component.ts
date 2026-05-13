import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AppBrandComponent } from '../app-brand/app-brand.component';

@Component({
  imports: [AppBrandComponent],
  selector: 'hg-app-top-bar',
  templateUrl: './app-top-bar.component.html',
  styleUrl: './app-top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTopBarComponent {
  @Input() statusLabel = 'Today';

}
