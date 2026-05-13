import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppBrandComponent } from '../app-brand/app-brand.component';

@Component({
  imports: [AppBrandComponent, MatButtonModule, MatChipsModule, MatIconModule, MatToolbarModule],
  selector: 'hg-app-top-bar',
  templateUrl: './app-top-bar.component.html',
  styleUrl: './app-top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTopBarComponent {
  @Input() statusLabel = 'Today';

}
