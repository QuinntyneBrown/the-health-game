// Acceptance Test
// Traces to: L2-005
// Description: ActivitiesService.logActivity POSTs to /api/goals/{goalId}/activities.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { ActivitiesService } from './activities.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('ActivitiesService.logActivity', () => {
  let service: ActivitiesService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(ActivitiesService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('POSTs the input to /api/goals/:goalId/activities and returns the new entry', async () => {
    const promise = firstValueFrom(
      service.logActivity('g-1', { quantity: 2, notes: 'morning walk' }),
    );
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1/activities`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantity: 2, notes: 'morning walk' });
    req.flush({
      id: 'a-1',
      goalId: 'g-1',
      quantity: 2,
      notes: 'morning walk',
      recordedAt: '2026-05-09T10:00:00Z',
    });
    const entry = await promise;
    expect(entry.id).toBe('a-1');
    expect(entry.quantity).toBe(2);
  });
});
