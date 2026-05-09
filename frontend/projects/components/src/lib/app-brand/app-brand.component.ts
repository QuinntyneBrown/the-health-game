import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'hg-app-brand',
  imports: [MatIconModule],
  templateUrl: './app-brand.component.html',
  styleUrl: './app-brand.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBrandComponent {
  readonly icon = input('local_fire_department');
  readonly name = input('HealthQuest');
}
