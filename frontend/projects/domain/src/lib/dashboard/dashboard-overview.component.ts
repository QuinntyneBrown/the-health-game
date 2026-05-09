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
}
