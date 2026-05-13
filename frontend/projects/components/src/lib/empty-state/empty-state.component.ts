import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hg-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title = 'No goals yet';
  @Input() description = 'Choose the smallest repeatable action. The game starts after the first log.';
  @Input() actionLabel = 'Create first goal';
  @Input() actionIcon = 'add';
  @Input() icon = 'flag';
  @Output() actionSelected = new EventEmitter<void>();

}
