import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardOverview } from './dashboard-overview.model';

export interface IDashboardService {
  getOverview(): Observable<DashboardOverview>;
}

export const DASHBOARD_SERVICE = new InjectionToken<IDashboardService>('DASHBOARD_SERVICE');
