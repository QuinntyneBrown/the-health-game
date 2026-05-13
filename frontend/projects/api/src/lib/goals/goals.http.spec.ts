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
    expect(req.request.body).toMatchObject({
      name: 'Hydrate',
      description: null,
      targetQuantity: 8,
      targetUnit: 'cups',
      cadence: { type: 2, interval: 1 },
    });
    req.flush({
      id: 'g-1',
      name: 'Hydrate',
      description: '',
      targetQuantity: 8,
      targetUnit: 'cups',
      cadence: { type: 2, interval: 1 },
      streak: { currentStreak: 0, longestStreak: 0 },
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
      targetQuantity: 8,
      targetUnit: 'cups',
      cadence: { type: 2, interval: 1 },
      streak: { currentStreak: 12, longestStreak: 18 },
    });
    expect((await promise).name).toBe('Hydrate');
  });

  it('PUTs /api/goals/:id with the update input and returns the updated goal', async () => {
    const input = {
      name: 'Hydrate (revised)',
      cadence: 'daily' as const,
      target: { value: 10, unit: 'cups' },
    };
    const promise = firstValueFrom(service.updateGoal('g-1', input));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toMatchObject({
      name: 'Hydrate (revised)',
      targetQuantity: 10,
      targetUnit: 'cups',
      cadence: { type: 2, interval: 1 },
    });
    req.flush({
      id: 'g-1',
      name: 'Hydrate (revised)',
      description: '',
      targetQuantity: 10,
      targetUnit: 'cups',
      cadence: { type: 2, interval: 1 },
      streak: { currentStreak: 3, longestStreak: 7 },
    });
    expect((await promise).name).toBe('Hydrate (revised)');
  });

  it('DELETEs /api/goals/:id', async () => {
    const promise = firstValueFrom(service.deleteGoal('g-1'));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await promise;
  });
});
