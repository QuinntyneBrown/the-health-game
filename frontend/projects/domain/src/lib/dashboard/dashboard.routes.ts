import { Routes } from '@angular/router';

import { DashboardOverviewComponent } from './dashboard-overview.component';
import { provideDashboardServices } from './dashboard.providers';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardOverviewComponent,
    providers: [provideDashboardServices()],
  },
];
