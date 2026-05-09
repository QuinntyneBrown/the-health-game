import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { GoalsService } from './goals/goals.service';
import { GOALS_SERVICE } from './goals/goals.service.contract';

export function provideApiServices(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: GOALS_SERVICE,
      useClass: GoalsService,
    },
  ]);
}
