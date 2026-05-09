import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { API_CONFIG, ApiConfig } from './api.config';
import { GoalsService } from './goals/goals.service';
import { GOALS_SERVICE } from './goals/goals.service.contract';

export function provideApiServices(config: ApiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: config },
    { provide: GOALS_SERVICE, useClass: GoalsService },
  ]);
}
