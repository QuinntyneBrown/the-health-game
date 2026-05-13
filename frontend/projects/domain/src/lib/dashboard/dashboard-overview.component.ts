import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GOALS_SERVICE, GoalSummary, REWARDS_SERVICE, Reward } from 'api';
import {
  ActionButtonComponent,
  AppTopBarComponent,
  GoalCardComponent,
  MetricCardComponent,
  NavigationBarComponent,
  NavigationBarItem,
  PageHeaderComponent,
  SectionHeaderComponent,
  StatusBannerComponent,
  WeekStripComponent,
} from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-dashboard-overview',
  imports: [
    ActionButtonComponent,
    AppTopBarComponent,
    GoalCardComponent,
    MetricCardComponent,
    NavigationBarComponent,
    PageHeaderComponent,
    SectionHeaderComponent,
    StatusBannerComponent,
    WeekStripComponent,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent implements OnInit {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly rewardsService = inject(REWARDS_SERVICE);

  readonly goals = signal<readonly GoalSummary[]>([]);
  readonly rewards = signal<readonly Reward[]>([]);
  readonly status = signal('Loading dashboard');
  readonly navItems: readonly NavigationBarItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'goals', label: 'Goals', icon: 'flag' },
    { id: 'rewards', label: 'Rewards', icon: 'redeem' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('Loading dashboard');
    try {
      const [goals, rewards] = await Promise.all([
        firstValueFrom(this.goalsService.getGoals()),
        firstValueFrom(this.rewardsService.getRewards()),
      ]);
      this.goals.set(goals);
      this.rewards.set(rewards);
      this.status.set(`Loaded ${goals.length} goals and ${rewards.length} rewards`);
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load dashboard'}`);
    }
  }

  completionPercent(): number {
    const goals = this.goals();
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + this.goalProgress(goal), 0);
    return Math.round(total / goals.length);
  }

  rewardsReady(): number {
    return this.rewards().filter((reward) => reward.status === 'ready-to-claim' || reward.status === 'earned').length;
  }

  bestCurrentStreak(): number {
    return this.goals().reduce((best, goal) => Math.max(best, goal.currentStreak), 0);
  }

  goalProgress(goal: GoalSummary): number {
    if (goal.target.value <= 0) return 0;
    return Math.round(Math.min(goal.completedQuantity / goal.target.value, 1) * 100);
  }

  goalDescription(goal: GoalSummary): string {
    return `${goal.target.value} ${goal.target.unit} - ${goal.cadence}`;
  }
}
