import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { DashboardService } from './dashboard.service';
import { DASHBOARD_SERVICE } from './dashboard.service.contract';

export function provideDashboardServices(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DASHBOARD_SERVICE,
      useClass: DashboardService,
    },
  ]);
}
