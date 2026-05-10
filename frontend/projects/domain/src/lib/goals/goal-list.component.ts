import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { GOALS_SERVICE, GoalSummary } from 'api';
import {
  EmptyStateComponent,
  GoalCardComponent,
  GoalCardTone,
  PageHeaderComponent,
  SegmentedFilterComponent,
  SegmentedFilterOption,
} from 'components';

import {
  CadenceFilter,
  filterGoalsByCadence,
  filterGoalsByName,
  GoalSortOrder,
  sortGoals,
} from './filter-goals';
import { GoalsOptimisticService } from './goals.optimistic.service';

const baseCadenceOptions: readonly SegmentedFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

@Component({
  selector: 'lib-goal-list',
  imports: [
    EmptyStateComponent,
    GoalCardComponent,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    SegmentedFilterComponent,
  ],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);
  private readonly optimistic = inject(GoalsOptimisticService);

  readonly cadence = signal<CadenceFilter>('all');
  readonly searchQuery = signal('');
  readonly sortOrder = signal<GoalSortOrder>('name');

  private readonly serverGoals = toSignal(this.goalsService.getGoals(), {
    initialValue: [] as const,
  });
  readonly goals = computed(() => [...this.serverGoals(), ...this.optimistic.pending()]);
  readonly cadenceOptions = computed<readonly SegmentedFilterOption[]>(() => {
    const goals = this.goals();
    return baseCadenceOptions.map((opt) => {
      const count =
        opt.value === 'all'
          ? goals.length
          : goals.filter((g) => g.cadence === opt.value).length;
      return { ...opt, label: `${opt.label} (${count})` };
    });
  });
  readonly visibleGoals = computed(() =>
    sortGoals(
      filterGoalsByName(filterGoalsByCadence(this.goals(), this.cadence()), this.searchQuery()),
      this.sortOrder(),
    ),
  );
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

  toneFor(goal: GoalSummary): GoalCardTone {
    if (goal.target.value > 0 && goal.completedQuantity >= goal.target.value) {
      return 'complete';
    }
    if (goal.currentStreak > 0) return 'streak';
    return 'default';
  }

  onCardSelected(goal: GoalSummary): void {
    void this.router.navigateByUrl(`/goals/${goal.id}`);
  }

  onCreate(): void {
    void this.router.navigateByUrl('/goals/new');
  }
}
