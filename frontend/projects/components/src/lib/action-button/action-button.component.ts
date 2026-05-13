import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hg-action-button',
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  @Input() label = 'Create goal';
  @Input() variant: 'primary' | 'ghost' | 'icon' | 'danger' = 'primary';
  @Input() ariaLabel = '';
  @Input() disabled = false;
  @Output() actionSelected = new EventEmitter<void>();

  get buttonClass(): string {
    if (this.variant === 'icon') return 'icon-button';
    if (this.variant === 'danger') return 'button button--ghost icon-button--danger';
    return `button button--${this.variant}`;
  }

}
