import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

export type NavigationBarVariant = 'bottom' | 'rail' | 'drawer' | 'tabs' | 'top';

export interface NavigationBarItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}

@Component({
  imports: [MatButtonToggleModule, MatIconModule],
  selector: 'hg-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationBarComponent {
  @Input() variant: NavigationBarVariant = 'bottom';
  @Input() items: readonly NavigationBarItem[] = [
    { id: 'home', label: 'Home' },
    { id: 'goals', label: 'Goals' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'profile', label: 'Profile' },
  ];
  @Input() activeItemId = 'home';
  @Output() itemSelected = new EventEmitter<string>();

  onSelectionChange(event: MatButtonToggleChange): void {
    if (typeof event.value === 'string') {
      this.itemSelected.emit(event.value);
    }
  }

}
