import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent, PageHeaderComponent } from 'components';

@Component({
  selector: 'lib-goal-empty',
  imports: [EmptyStateComponent, PageHeaderComponent],
  templateUrl: './goal-empty.component.html',
  styleUrl: './goal-empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalEmptyComponent {}
