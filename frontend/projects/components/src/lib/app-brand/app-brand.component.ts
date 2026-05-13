import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'hg-app-brand',
  templateUrl: './app-brand.component.html',
  styleUrl: './app-brand.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBrandComponent {
  @Input() label = 'HealthQuest';
  @Input() isLarge = false;
  @Input() icon = 'favorite';

}
