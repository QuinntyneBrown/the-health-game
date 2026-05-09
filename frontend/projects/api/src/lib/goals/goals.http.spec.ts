// Acceptance Test
// Traces to: L2-002
// Description: GoalsService.getGoals fetches /api/goals over HTTP.
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

describe('GoalsService.getGoals', () => {
  let service: GoalsService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(GoalsService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('GETs /api/goals and returns the array as-is', async () => {
    const promise = firstValueFrom(service.getGoals());
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(await promise).toEqual([]);
  });

  it('POSTs /api/goals with the create input and returns the created goal', async () => {
    const input = {
      name: 'Hydrate',
      cadence: 'daily' as const,
      target: { value: 8, unit: 'cups' },
    };
    const promise = firstValueFrom(service.createGoal(input));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({
      id: 'g-1',
      name: 'Hydrate',
      description: '',
      cadence: 'daily',
      target: { value: 8, unit: 'cups' },
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    });
    expect((await promise).id).toBe('g-1');
  });

  it('GETs /api/goals/:id and returns the matching goal', async () => {
    const promise = firstValueFrom(service.getGoal('g-1'));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'g-1',
      name: 'Hydrate',
      description: 'Drink water',
      cadence: 'daily',
      target: { value: 8, unit: 'cups' },
      completedQuantity: 6,
      currentStreak: 12,
      longestStreak: 18,
      rewardName: '',
    });
    expect((await promise).name).toBe('Hydrate');
  });
});
