import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'hg-action-button',
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  @Input() label = 'Create goal';
  @Input() variant: 'primary' | 'ghost' | 'icon' | 'danger' = 'primary';
  @Input() icon = '';
  @Input() ariaLabel = '';
  @Input() testId = '';
  @Input() disabled = false;
  @Output() actionSelected = new EventEmitter<void>();

  get iconName(): string { return this.icon || (this.variant === 'danger' ? 'delete' : 'more_horiz'); }

}
