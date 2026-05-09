import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ActionButtonVariant =
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text'
  | 'elevated'
  | 'icon'
  | 'fab'
  | 'mini-fab'
  | 'extended-fab';

export type ActionButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'hg-action-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  readonly action = output<void>();
  readonly ariaLabel = input<string | null>(null);
  readonly disabled = input(false);
  readonly icon = input<string | null>(null);
  readonly label = input('');
  readonly type = input<ActionButtonType>('button');
  readonly variant = input<ActionButtonVariant>('filled');

  onAction(): void {
    if (!this.disabled()) {
      this.action.emit();
    }
  }
}
