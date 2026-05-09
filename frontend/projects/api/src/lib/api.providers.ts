import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ActivitiesService } from './activities/activities.service';
import { ACTIVITIES_SERVICE } from './activities/activities.service.contract';
import { API_CONFIG, ApiConfig } from './api.config';
import { authInterceptor } from './auth/auth.interceptor';
import { errorInterceptor } from './errors/error.interceptor';
import { GoalsService } from './goals/goals.service';
import { GOALS_SERVICE } from './goals/goals.service.contract';
import { UsersService } from './users/users.service';
import { USERS_SERVICE } from './users/users.service.contract';

export function provideApiServices(config: ApiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: API_CONFIG, useValue: config },
    { provide: ACTIVITIES_SERVICE, useClass: ActivitiesService },
    { provide: GOALS_SERVICE, useClass: GoalsService },
    { provide: USERS_SERVICE, useClass: UsersService },
  ]);
}
