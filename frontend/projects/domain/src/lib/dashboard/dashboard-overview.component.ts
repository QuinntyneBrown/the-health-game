import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, defer, of, repeat, Subject, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import {
  EmptyStateComponent,
  GoalCardComponent,
  MetricCardComponent,
  PageHeaderComponent,
  RewardCardComponent,
  SectionHeaderComponent,
  UserAvatarComponent,
} from 'components';

import { IfRoleDirective } from '../auth/if-role.directive';

import { DashboardOverview } from './dashboard-overview.model';
import { DASHBOARD_SERVICE } from './dashboard.service.contract';

const emptyOverview: DashboardOverview = {
  dateLabel: '',
  goals: [],
  greeting: '',
  metrics: [],
  rewards: [],
};

@Component({
  selector: 'hg-dashboard-overview',
  imports: [
    EmptyStateComponent,
    GoalCardComponent,
    IfRoleDirective,
    MatButtonModule,
    MetricCardComponent,
    PageHeaderComponent,
    RewardCardComponent,
    SectionHeaderComponent,
    UserAvatarComponent,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent {
  private readonly dashboardService = inject(DASHBOARD_SERVICE);
  private readonly router = inject(Router);
  private readonly retry$ = new Subject<void>();
  readonly hasError = signal(false);

  readonly overview = toSignal(
    defer(() => this.dashboardService.getOverview()).pipe(
      catchError(() => {
        this.hasError.set(true);
        return of(emptyOverview);
      }),
      repeat({ delay: () => this.retry$ }),
    ),
    { initialValue: emptyOverview },
  );

  retry(): void {
    this.hasError.set(false);
    this.retry$.next();
  }

  readonly todayActivityTotal = computed(() => {
    const todayMetric = this.overview().metrics.find((m) => m.label === 'Today');
    if (!todayMetric) return 0;
    const parsed = parseFloat(todayMetric.value);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  onGoalActionSelected(goalId: string): void {
    void this.router.navigateByUrl(`/goals/${goalId}`);
  }

  onNewGoal(): void {
    void this.router.navigateByUrl('/goals/new');
  }

  onRewardSelected(rewardId: string): void {
    void this.router.navigateByUrl(`/rewards/${rewardId}`);
  }

  readonly weeklyChart: readonly { label: string; value: number }[] = [
    { label: 'Mon', value: 60 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 95 },
    { label: 'Fri', value: 70 },
    { label: 'Sat', value: 55 },
    { label: 'Sun', value: 30 },
  ];
}
