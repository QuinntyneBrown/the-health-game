import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  GoalCardComponent,
  MetricCardComponent,
  PageHeaderComponent,
  RewardCardComponent,
  SectionHeaderComponent,
} from 'components';

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
    GoalCardComponent,
    MetricCardComponent,
    PageHeaderComponent,
    RewardCardComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent {
  private readonly dashboardService = inject(DASHBOARD_SERVICE);

  readonly overview = toSignal(this.dashboardService.getOverview(), {
    initialValue: emptyOverview,
  });

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
