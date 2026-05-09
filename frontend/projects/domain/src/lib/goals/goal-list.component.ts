import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GOALS_SERVICE, GoalSummary } from 'api';
import {
  EmptyStateComponent,
  GoalCardComponent,
  PageHeaderComponent,
  SegmentedFilterComponent,
  SegmentedFilterOption,
} from 'components';

import { CadenceFilter, filterGoalsByCadence } from './filter-goals';

const cadenceOptions: readonly SegmentedFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

@Component({
  selector: 'lib-goal-list',
  imports: [EmptyStateComponent, GoalCardComponent, PageHeaderComponent, SegmentedFilterComponent],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);

  readonly cadenceOptions = cadenceOptions;
  readonly cadence = signal<CadenceFilter>('all');

  readonly goals = toSignal(this.goalsService.getGoals(), { initialValue: [] as const });
  readonly visibleGoals = computed(() => filterGoalsByCadence(this.goals(), this.cadence()));
  readonly isEmpty = computed(() => this.goals().length === 0);
  readonly subtitle = computed(() => {
    const total = this.goals().length;
    const streaking = this.goals().filter((g) => g.currentStreak > 0).length;
    const goalLabel = total === 1 ? '1 active goal' : `${total} active goals`;
    const streakLabel = streaking === 1 ? '1 streak running' : `${streaking} streaks running`;
    return `${goalLabel} · ${streakLabel}`;
  });

  cadenceLabel(goal: GoalSummary): string {
    return goal.cadence.charAt(0).toUpperCase() + goal.cadence.slice(1);
  }

  progressLabel(goal: GoalSummary): string {
    return `${goal.completedQuantity} / ${goal.target.value} ${goal.target.unit}`;
  }

  progressValue(goal: GoalSummary): number {
    return goal.target.value === 0
      ? 0
      : Math.min(100, Math.round((goal.completedQuantity / goal.target.value) * 100));
  }

  currentStreakLabel(goal: GoalSummary): string {
    return `${goal.currentStreak}-day streak`;
  }

  longestStreakLabel(goal: GoalSummary): string {
    return `Best ${goal.longestStreak}`;
  }

  onCardSelected(goal: GoalSummary): void {
    void this.router.navigateByUrl(`/goals/${goal.id}`);
  }

  onCreate(): void {
    void this.router.navigateByUrl('/goals/new');
  }
}
