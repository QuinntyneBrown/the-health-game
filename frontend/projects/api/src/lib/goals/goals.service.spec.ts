// Acceptance Test
// Traces to: L2-032, L2-033
// Description: Verifies the API library exposes goal data through its service abstraction.
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { GoalsService } from './goals.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('GoalsService', () => {
  it('returns goal summaries from the backend-facing service contract', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: API_CONFIG, useValue: config }],
    });
    const service = TestBed.inject(GoalsService);

    const goals = await firstValueFrom(service.getGoalSummaries());

    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].target.value).toBeGreaterThan(0);
  });
});
