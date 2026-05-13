import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-goal-detail',
  templateUrl: './goal-detail.component.html',
  styleUrl: './goal-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalDetailComponent {}
