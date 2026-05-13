import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewComponent {}
