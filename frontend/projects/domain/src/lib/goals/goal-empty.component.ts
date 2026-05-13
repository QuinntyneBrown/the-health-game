import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-goal-empty',
  templateUrl: './goal-empty.component.html',
  styleUrl: './goal-empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalEmptyComponent {}
