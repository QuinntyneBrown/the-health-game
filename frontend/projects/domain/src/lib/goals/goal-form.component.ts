import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-goal-form',
  templateUrl: './goal-form.component.html',
  styleUrl: './goal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent {}
