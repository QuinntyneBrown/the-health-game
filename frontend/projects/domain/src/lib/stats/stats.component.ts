import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GOALS_SERVICE, GoalSummary, REWARDS_SERVICE, Reward } from 'api';
import {
  MetricCardComponent,
  PageHeaderComponent,
  SectionHeaderComponent,
  SegmentedFilterComponent,
  SegmentedFilterOption,
  StatusBannerComponent,
  WeekStripComponent,
} from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-stats',
  imports: [
    MetricCardComponent,
    PageHeaderComponent,
    SectionHeaderComponent,
    SegmentedFilterComponent,
    StatusBannerComponent,
    WeekStripComponent,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent implements OnInit {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly rewardsService = inject(REWARDS_SERVICE);

  readonly goals = signal<readonly GoalSummary[]>([]);
  readonly rewards = signal<readonly Reward[]>([]);
  readonly status = signal('Loading stats');
  readonly options: readonly SegmentedFilterOption[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];
  range = 'week';

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      const [goals, rewards] = await Promise.all([
        firstValueFrom(this.goalsService.getGoals()),
        firstValueFrom(this.rewardsService.getRewards()),
      ]);
      this.goals.set(goals);
      this.rewards.set(rewards);
      this.status.set(`Loaded ${this.range} stats`);
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load stats'}`);
    }
  }

  setRange(value: string): void {
    this.range = value;
    this.status.set(`Showing ${value} stats`);
  }

  completionPercent(): number {
    const goals = this.goals();
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => {
      if (goal.target.value <= 0) return sum;
      return sum + Math.min(goal.completedQuantity / goal.target.value, 1) * 100;
    }, 0);
    return Math.round(total / goals.length);
  }
}
