import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-goal-list',
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {}
