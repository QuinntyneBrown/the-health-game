// Acceptance Test
// Traces to: L2-032, L2-033
// Description: Verifies the API library exposes goal data through its service abstraction.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    const service = TestBed.inject(GoalsService);

    const promise = firstValueFrom(service.getGoalSummaries());
    const controller = TestBed.inject(HttpTestingController);
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals`);
    req.flush([
      {
        id: 'g-1',
        name: 'Hydrate',
        description: 'Water',
        targetQuantity: 8,
        targetUnit: 'cups',
        cadence: { type: 2, interval: 1 },
        timeZoneId: 'UTC',
        weekStartsOn: 1,
        streak: { currentStreak: 2, longestStreak: 5 },
        createdAtUtc: '2026-05-09T10:00:00Z',
        updatedAtUtc: null,
      },
    ]);
    const goals = await promise;

    expect(goals[0].target.value).toBe(8);
    expect(goals[0].weekStartsOn).toBe('monday');
    controller.verify();
  });
});
