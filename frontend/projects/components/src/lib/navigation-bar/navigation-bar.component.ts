import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type NavigationBarVariant = 'bottom' | 'rail' | 'drawer';

export interface NavigationBarItem {
  readonly badgeLabel?: string;
  readonly disabled?: boolean;
  readonly icon: string;
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'hg-navigation-bar',
  imports: [MatBadgeModule, MatButtonModule, MatIconModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationBarComponent {
  readonly itemSelected = output<string>();
  readonly activeItemId = input<string | null>(null);
  readonly ariaLabel = input('Primary navigation');
  readonly items = input<readonly NavigationBarItem[]>([]);
  readonly variant = input<NavigationBarVariant>('bottom');

  selectItem(item: NavigationBarItem): void {
    if (!item.disabled) {
      this.itemSelected.emit(item.id);
    }
  }
}
