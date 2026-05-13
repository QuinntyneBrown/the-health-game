// Acceptance Test
// Traces to: L2-009
// Description: RewardsService.createReward POSTs to /api/goals/:goalId/rewards.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { RewardsService } from './rewards.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('RewardsService', () => {
  let service: RewardsService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(RewardsService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('POSTs the reward input to /api/goals/:goalId/rewards', async () => {
    const promise = firstValueFrom(
      service.createReward('g-1', {
        name: 'New playlist',
        description: 'Earned by completing daily walks',
        condition: { type: 'streak-milestone', streakDays: 7 },
      }),
    );
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1/rewards`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'New playlist',
      description: 'Earned by completing daily walks',
      condition: { type: 2, requiredStreakCount: 7 },
    });
    req.flush({
      id: 'r-1',
      goalId: 'g-1',
      name: 'New playlist',
      description: 'Earned by completing daily walks',
      condition: { type: 2, requiredStreakCount: 7 },
      isEarned: false,
      earnedAtUtc: null,
    });
    expect((await promise).id).toBe('r-1');
  });

  it('GETs /api/rewards and returns the list', async () => {
    const promise = firstValueFrom(service.getRewards());
    const req = controller.expectOne(`${config.apiBaseUrl}/api/rewards`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(await promise).toEqual([]);
  });
});
